/**
 * OAuth/SSO configuration for Payload CMS.
 *
 * Activates when the following environment variables are set:
 *   OAUTH_GOOGLE_CLIENT_ID
 *   OAUTH_GOOGLE_CLIENT_SECRET
 *
 * Add more providers by following the same pattern.
 * Each provider maps an external profile to a local Payload user.
 */

export type OAuthProviderConfig = {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  mapProfile: (profile: Record<string, unknown>) => {
    email: string;
    name?: string;
  };
};

function buildGoogleProvider(): OAuthProviderConfig | null {
  const clientId = process.env.OAUTH_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  return {
    name: 'google',
    clientId,
    clientSecret,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
    mapProfile: (profile) => ({
      email: profile.email as string,
      name: profile.name as string | undefined,
    }),
  };
}

export function getEnabledOAuthProviders(): OAuthProviderConfig[] {
  const providers: (OAuthProviderConfig | null)[] = [
    buildGoogleProvider(),
    // Add more providers here: buildGitHubProvider(), buildAzureADProvider(), etc.
  ];

  return providers.filter((p): p is OAuthProviderConfig => p !== null);
}
