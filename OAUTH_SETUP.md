# OAuth Integration Setup Guide

This guide explains how to set up OAuth integrations for Gmail, Outlook, Slack, and other services.

## Prerequisites

- A Supabase project
- Access to create OAuth apps on respective platforms

## Google OAuth (Gmail, Google Sheets, Google Calendar)

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Gmail API
   - Google Sheets API
   - Google Calendar API

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in app information:
   - App name: CertusFlow
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/calendar`
5. Add test users (while in testing mode)

### 3. Create OAuth Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/oauth/callback/gmail`
   - `http://localhost:3000/api/oauth/callback/google-sheets`
   - `http://localhost:3000/api/oauth/callback/google-calendar`
   - Add production URLs when deploying
5. Copy the Client ID and Client Secret

### 4. Update .env.local

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## Microsoft OAuth (Outlook, Teams, OneDrive)

### 1. Register App in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in details:
   - Name: CertusFlow
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: `http://localhost:3000/api/oauth/callback/outlook`

### 2. Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph**
3. Add delegated permissions:
   - `Mail.ReadWrite`
   - `Mail.Send`
   - `Chat.ReadWrite`
   - `ChatMessage.Send`
   - `Files.ReadWrite.All`
   - `offline_access`

### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description and expiration
4. Copy the secret value immediately (won't be shown again)

### 4. Add More Redirect URIs

1. Go to **Authentication**
2. Add redirect URIs:
   - `http://localhost:3000/api/oauth/callback/microsoft-teams`
   - `http://localhost:3000/api/oauth/callback/onedrive`
   - Add production URLs when deploying

### 5. Update .env.local

```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_application_id
MICROSOFT_CLIENT_SECRET=your_client_secret
```

---

## Slack OAuth

### 1. Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** > **From scratch**
3. Enter app name: CertusFlow
4. Choose a workspace for development

### 2. Configure OAuth & Permissions

1. Go to **OAuth & Permissions**
2. Add redirect URLs:
   - `http://localhost:3000/api/oauth/callback/slack`
   - Add production URLs when deploying
3. Add Bot Token Scopes:
   - `channels:read`
   - `chat:write`
   - `files:write`
   - `incoming-webhook`

### 3. Get Credentials

1. Go to **Basic Information**
2. Copy **Client ID** and **Client Secret**

### 4. Update .env.local

```bash
NEXT_PUBLIC_SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
```

---

## Dropbox OAuth

### 1. Create Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Choose **Scoped access**
4. Choose **Full Dropbox** access
5. Name your app: CertusFlow

### 2. Configure App

1. Go to **Permissions** tab
2. Enable:
   - `files.content.write`
   - `files.content.read`
3. Go to **Settings** tab
4. Add redirect URIs:
   - `http://localhost:3000/api/oauth/callback/dropbox`

### 3. Get Credentials

1. Copy **App key** (Client ID)
2. Copy **App secret** (Client Secret)

### 4. Update .env.local

```bash
NEXT_PUBLIC_DROPBOX_CLIENT_ID=your_app_key
DROPBOX_CLIENT_SECRET=your_app_secret
```

---

## Testing Integrations

### 1. Start Development Server

```bash
npm run dev
```

### 2. Navigate to Integrations Page

- Go to http://localhost:3000/de/login
- Login with your account
- Navigate to **Dashboard** > **Integrationen**

### 3. Connect Integration

1. Click **Verbinden** on any integration
2. You'll be redirected to the OAuth provider
3. Grant permissions
4. You'll be redirected back to the integrations page
5. The integration should now show as connected

---

## Production Deployment

### Update Redirect URIs

When deploying to production, update all OAuth redirect URIs:

1. **Google Cloud Console**: Add `https://yourdomain.com/api/oauth/callback/*`
2. **Azure Portal**: Add `https://yourdomain.com/api/oauth/callback/*`
3. **Slack API**: Add `https://yourdomain.com/api/oauth/callback/slack`
4. **Dropbox App Console**: Add `https://yourdomain.com/api/oauth/callback/dropbox`

### Update Environment Variables

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Troubleshooting

### "redirect_uri_mismatch" Error

- Ensure the redirect URI in your OAuth app matches exactly
- Check for trailing slashes
- Verify http vs https

### "invalid_client" Error

- Check that Client ID and Client Secret are correct
- Ensure secrets are properly set in .env.local
- Restart development server after updating .env.local

### "insufficient_scope" Error

- Review required scopes in the OAuth configuration
- Re-authorize the integration after adding new scopes

### Tokens Expired

- The system automatically refreshes tokens using the refresh_token
- If refresh fails, the user needs to reconnect the integration

---

## Security Best Practices

1. **Never commit .env.local** - Already in .gitignore
2. **Rotate secrets regularly** - Especially for production
3. **Use environment variables** - Never hardcode credentials
4. **HTTPS in production** - Always use secure connections
5. **Validate redirect URIs** - Prevent OAuth hijacking
6. **Store tokens encrypted** - Supabase handles this automatically
7. **Implement token refresh** - Already implemented in oauth.ts

---

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review provider-specific OAuth docs
- Open an issue on GitHub
