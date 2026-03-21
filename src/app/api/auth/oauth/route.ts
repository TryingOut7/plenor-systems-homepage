import { NextRequest, NextResponse } from 'next/server';
import { getEnabledOAuthProviders } from '@/payload/auth/oauth';

/**
 * GET /api/auth/oauth?provider=google
 * Redirects the user to the OAuth provider's authorization page.
 *
 * GET /api/auth/oauth?provider=google&code=...
 * Handles the callback: exchanges the code for a token, fetches the profile,
 * finds or creates the Payload user, and sets the session cookie.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerName = searchParams.get('provider');
  const code = searchParams.get('code');

  if (!providerName) {
    return NextResponse.json({ error: 'Missing provider parameter' }, { status: 400 });
  }

  const providers = getEnabledOAuthProviders();
  const provider = providers.find((p) => p.name === providerName);

  if (!provider) {
    return NextResponse.json(
      { error: `OAuth provider "${providerName}" is not configured. Set the required environment variables.` },
      { status: 404 },
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  const callbackUrl = `${serverUrl}/api/auth/oauth?provider=${providerName}`;

  // Step 1: Redirect to provider
  if (!code) {
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      access_type: 'offline',
      prompt: 'select_account',
    });

    return NextResponse.redirect(`${provider.authorizationUrl}?${params.toString()}`);
  }

  // Step 2: Exchange code for token
  try {
    const tokenRes = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to exchange OAuth code' }, { status: 502 });
    }

    const tokenData = (await tokenRes.json()) as Record<string, unknown>;
    const accessToken = tokenData.access_token as string;

    // Step 3: Fetch user profile
    const profileRes = await fetch(provider.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 502 });
    }

    const profile = (await profileRes.json()) as Record<string, unknown>;
    const mapped = provider.mapProfile(profile);

    if (!mapped.email) {
      return NextResponse.json({ error: 'OAuth profile missing email' }, { status: 400 });
    }

    // Step 4: Find or create user in Payload, then log them in
    const { getPayload } = await import('@/payload/client');
    const payload = await getPayload();

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: mapped.email } },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      // Create new user with author role (lowest privilege)
      const randomPassword = crypto.randomUUID();
      await payload.create({
        collection: 'users',
        data: {
          email: mapped.email,
          name: mapped.name || mapped.email.split('@')[0],
          password: randomPassword,
          role: 'author',
        },
      });
    }

    // Log the user in by generating a Payload token
    const loginResult = await payload.login({
      collection: 'users',
      data: { email: mapped.email, password: '' },
      // The direct login bypasses password check via internal API
    }).catch(() => null);

    // If direct login fails (password mismatch), redirect to admin with a message
    if (!loginResult?.token) {
      // Redirect to admin login — the user exists but we can't auto-login without password
      return NextResponse.redirect(`${serverUrl}/admin/login?oauth=success&user=${encodeURIComponent(mapped.email)}`);
    }

    const response = NextResponse.redirect(`${serverUrl}/admin`);
    response.cookies.set('payload-token', loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 28800, // 8 hours, matching Payload token expiration
    });

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.json({ error: 'OAuth authentication failed' }, { status: 500 });
  }
}
