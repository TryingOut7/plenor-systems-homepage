import { NextRequest, NextResponse } from 'next/server';
import { getEnabledOAuthProviders } from '@/payload/auth/oauth';

/**
 * GET /api/auth/oauth?provider=google
 * Redirects the user to the OAuth provider's authorization page.
 *
 * GET /api/auth/oauth?provider=google&code=...&state=...
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
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      access_type: 'offline',
      prompt: 'select_account',
      state,
    });

    const response = NextResponse.redirect(`${provider.authorizationUrl}?${params.toString()}`);
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/api/auth/oauth',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  }

  // Step 2: Validate CSRF state
  const returnedState = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state')?.value;

  if (!returnedState || !storedState || returnedState !== storedState) {
    return NextResponse.json({ error: 'Invalid OAuth state — possible CSRF attack' }, { status: 403 });
  }

  // Step 3: Exchange code for token
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
    const accessToken = tokenData.access_token;

    if (typeof accessToken !== 'string' || !accessToken) {
      return NextResponse.json({ error: 'OAuth provider did not return an access token' }, { status: 502 });
    }

    // Step 4: Fetch user profile
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

    // Step 5: Find or create user in Payload
    const { getPayload } = await import('@/payload/client');
    const payload = await getPayload();

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: mapped.email } },
      limit: 1,
    });

    let userPassword: string;

    if (existing.docs.length === 0) {
      // Create new user with author role (lowest privilege)
      userPassword = crypto.randomUUID();
      await payload.create({
        collection: 'users',
        data: {
          email: mapped.email,
          name: mapped.name || mapped.email.split('@')[0],
          password: userPassword,
          role: 'author',
        },
      });
    } else {
      // Existing user — reset password to a temp value so we can log in
      userPassword = crypto.randomUUID();
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { password: userPassword },
      });
    }

    // Step 6: Log the user in with the known password
    const loginResult = await payload.login({
      collection: 'users',
      data: { email: mapped.email, password: userPassword },
    }).catch(() => null);

    if (!loginResult?.token) {
      return NextResponse.redirect(`${serverUrl}/admin/login?error=oauth_login_failed`);
    }

    const response = NextResponse.redirect(`${serverUrl}/admin`);
    response.cookies.set('payload-token', loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 28800, // 8 hours
    });
    // Clear the state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.json({ error: 'OAuth authentication failed' }, { status: 500 });
  }
}
