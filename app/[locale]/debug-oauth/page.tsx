import { getOAuthUrl, OAUTH_CONFIGS } from '@/lib/integrations/oauth';

export default function OAuthDebugPage() {
  const dropboxConfig = OAUTH_CONFIGS.dropbox;
  
  // Simuliere User ID für Test
  const testUserId = 'test-user-123';
  
  let oauthUrl = '';
  try {
    oauthUrl = getOAuthUrl('dropbox', testUserId);
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Dropbox OAuth Debug</h1>
      
      <div className="space-y-6">
        {/* Configuration */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Konfiguration</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium text-gray-700">Client ID:</dt>
              <dd className="text-sm font-mono bg-gray-100 p-2 rounded">
                {dropboxConfig.clientId || '❌ NICHT GESETZT'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Client Secret:</dt>
              <dd className="text-sm font-mono bg-gray-100 p-2 rounded">
                {dropboxConfig.clientSecret ? '✅ Gesetzt (versteckt)' : '❌ NICHT GESETZT'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Redirect URI:</dt>
              <dd className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                {dropboxConfig.redirectUri}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Scopes:</dt>
              <dd className="text-sm font-mono bg-gray-100 p-2 rounded">
                {dropboxConfig.scope.join(', ')}
              </dd>
            </div>
          </dl>
        </div>

        {/* OAuth URL */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generierte OAuth URL</h2>
          <div className="bg-gray-100 p-4 rounded overflow-x-auto">
            <code className="text-xs break-all">{oauthUrl || '❌ Fehler beim Generieren'}</code>
          </div>
          {oauthUrl && (
            <a
              href={oauthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Test OAuth Flow
            </a>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Dropbox App Console Checklist</h2>
          <ol className="space-y-3 list-decimal list-inside">
            <li>
              <strong>Gehe zu:</strong>
              <a 
                href="https://www.dropbox.com/developers/apps" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                https://www.dropbox.com/developers/apps
              </a>
            </li>
            <li>
              <strong>Öffne deine App "certusflow"</strong>
            </li>
            <li>
              <strong>Unter "OAuth 2" → "Redirect URIs" muss stehen:</strong>
              <div className="bg-yellow-50 p-3 mt-2 rounded border border-yellow-200">
                <code className="text-sm break-all">{dropboxConfig.redirectUri}</code>
              </div>
            </li>
            <li>
              <strong>App Type:</strong> Scoped access (nicht "Full Dropbox")
            </li>
            <li>
              <strong>Permissions aktiviert:</strong>
              <ul className="ml-6 mt-2 space-y-1">
                <li>✓ files.content.write</li>
                <li>✓ files.content.read</li>
              </ul>
            </li>
            <li>
              <strong>Klicke "Submit"</strong> nach jeder Änderung!
            </li>
          </ol>
        </div>

        {/* Environment Variables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={dropboxConfig.clientId ? 'text-green-600' : 'text-red-600'}>
                {dropboxConfig.clientId ? '✅' : '❌'}
              </span>
              <code>NEXT_PUBLIC_DROPBOX_CLIENT_ID</code>
            </div>
            <div className="flex items-center space-x-2">
              <span className={dropboxConfig.clientSecret ? 'text-green-600' : 'text-red-600'}>
                {dropboxConfig.clientSecret ? '✅' : '❌'}
              </span>
              <code>DROPBOX_CLIENT_SECRET</code>
            </div>
            <div className="flex items-center space-x-2">
              <span className={process.env.NEXT_PUBLIC_APP_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_APP_URL ? '✅' : '❌'}
              </span>
              <code>NEXT_PUBLIC_APP_URL</code>
              {process.env.NEXT_PUBLIC_APP_URL && (
                <span className="text-sm text-gray-600">
                  = {process.env.NEXT_PUBLIC_APP_URL}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
