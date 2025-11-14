/**
 * OAuth Integration Service
 * Handles OAuth flows for Gmail, Outlook, Slack, and other integrations
 */

import { getSelectedScopes } from './permissions';

export type IntegrationType = 
  | 'gmail' 
  | 'outlook' 
  | 'slack' 
  | 'google-sheets'
  | 'google-calendar'
  | 'microsoft-teams'
  | 'dropbox'
  | 'onedrive';

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  icon?: string;
}

// OAuth configurations for each integration
export const OAUTH_CONFIGS: Record<IntegrationType, OAuthConfig> = {
  'gmail': {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/gmail`,
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  'google-sheets': {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/google-sheets`,
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  'google-calendar': {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/google-calendar`,
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  'outlook': {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/outlook`,
    scope: [
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/Mail.Send',
      'offline_access'
    ],
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  },
  'microsoft-teams': {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/microsoft-teams`,
    scope: [
      'https://graph.microsoft.com/Chat.ReadWrite',
      'https://graph.microsoft.com/ChatMessage.Send',
      'offline_access'
    ],
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  },
  'slack': {
    clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/slack`,
    scope: [
      'channels:read',
      'chat:write',
      'files:write',
      'incoming-webhook'
    ],
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access'
  },
  dropbox: {
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scope: ['files.content.write', 'files.content.read'],
    clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID!,
    clientSecret: process.env.DROPBOX_CLIENT_SECRET!,
    redirectUri: process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/dropbox`
      : 'https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox',
    icon: '/icons/dropbox.svg',
  },
  'onedrive': {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/oauth/callback/onedrive`,
    scope: [
      'https://graph.microsoft.com/Files.ReadWrite.All',
      'offline_access'
    ],
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  }
};

/**
 * Generate OAuth authorization URL with custom permissions
 */
export function getOAuthUrl(
  integrationType: IntegrationType, 
  userId: string,
  selectedPermissions?: string[]
): string {
  const config = OAUTH_CONFIGS[integrationType];
  
  if (!config.clientId) {
    throw new Error(`OAuth client ID not configured for ${integrationType}`);
  }

  // Use custom permissions if provided, otherwise use default scopes
  const scopes = selectedPermissions 
    ? getSelectedScopes(integrationType, selectedPermissions)
    : config.scope;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state: JSON.stringify({ userId, integrationType, selectedPermissions }),
  });

  // Dropbox requires token_access_type for refresh tokens
  if (integrationType === 'dropbox') {
    params.append('token_access_type', 'offline');
  } else {
    // Google, Microsoft, etc. use these parameters
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  integrationType: IntegrationType,
  code: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}> {
  const config = OAUTH_CONFIGS[integrationType];

  // Get client secret from config or environment
  const clientSecret = config.clientSecret || 
    process.env[`${integrationType.toUpperCase().replace(/-/g, '_')}_CLIENT_SECRET`] || '';

  const body: Record<string, string> = {
    code,
    client_id: config.clientId,
    client_secret: clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code'
  };

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Token exchange failed for ${integrationType}:`, errorText);
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  integrationType: IntegrationType,
  refreshToken: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const config = OAUTH_CONFIGS[integrationType];

  const body: Record<string, string> = {
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: process.env[`${integrationType.toUpperCase().replace(/-/g, '_')}_CLIENT_SECRET`] || '',
    grant_type: 'refresh_token'
  };

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body)
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Test integration connection
 */
export async function testIntegrationConnection(
  integrationType: IntegrationType,
  accessToken: string
): Promise<{ success: boolean; email?: string; name?: string }> {
  try {
    switch (integrationType) {
      case 'gmail':
      case 'google-sheets':
      case 'google-calendar':
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const googleData = await googleResponse.json();
        return { success: true, email: googleData.email, name: googleData.name };

      case 'outlook':
      case 'microsoft-teams':
      case 'onedrive':
        const msResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const msData = await msResponse.json();
        return { success: true, email: msData.mail || msData.userPrincipalName, name: msData.displayName };

      case 'slack':
        const slackResponse = await fetch('https://slack.com/api/auth.test', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const slackData = await slackResponse.json();
        return { success: slackData.ok, name: slackData.user };

      case 'dropbox':
        const dropboxResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const dropboxData = await dropboxResponse.json();
        return { success: true, email: dropboxData.email, name: dropboxData.name?.display_name };

      default:
        return { success: false };
    }
  } catch (error) {
    console.error('Integration test failed:', error);
    return { success: false };
  }
}
