# OAuth API Setup Guide - Alle Integrationen einrichten

Dieser Guide zeigt dir, wie du die OAuth-APIs für alle Integrationen in CertusFlow einrichtest.

## 📋 Übersicht

Für jede Integration benötigst du:
- **Client ID** - Öffentliche ID deiner App
- **Client Secret** - Geheimer Schlüssel (nie im Frontend!)
- **Redirect URIs** - Wohin nach OAuth-Erfolg weitergeleitet wird

---

## 1. 🟥 **Gmail / Google APIs**

### Schritt 1: Google Cloud Console öffnen
1. **Direktlink**: https://console.cloud.google.com/projectcreate
2. Erstelle ein neues Projekt:
   - **Project name**: `CertusFlow`
   - **Location**: Keine Organisation (leer lassen)
   - Klicke **CREATE**
3. Warte bis das Projekt erstellt ist (ca. 30 Sekunden)

### Schritt 2: OAuth Consent Screen konfigurieren
1. **Direktlink**: https://console.cloud.google.com/apis/credentials/consent
2. Wähle dein Projekt `CertusFlow` aus (oben in der Leiste)
3. Klicke auf **Configure Consent Screen**
4. Wähle **External** → Klicke **CREATE**
5. **OAuth consent screen** ausfüllen:
   - **App name**: `CertusFlow`
   - **User support email**: Deine Gmail-Adresse
   - **App logo**: (Optional, kannst du überspringen)
   - **App domain**: Kannst du leer lassen
   - **Authorized domains**: `github.dev`
   - **Developer contact information**: Deine Gmail-Adresse
6. Klicke **SAVE AND CONTINUE**

### Schritt 3: Scopes hinzufügen
1. Auf der **Scopes** Seite klicke **ADD OR REMOVE SCOPES**
2. Suche nach folgenden Scopes und aktiviere sie (Checkbox):
   - `auth/gmail.readonly` - E-Mails lesen
   - `auth/gmail.send` - E-Mails senden  
   - `auth/gmail.modify` - E-Mails ändern
   - `auth/spreadsheets` - Google Sheets
   - `auth/calendar` - Google Calendar
   - `auth/userinfo.email` - Email-Adresse
   - `auth/userinfo.profile` - Profil-Info
3. Klicke **UPDATE** → **SAVE AND CONTINUE**
4. **Test users**: Überspringe dies, klicke **SAVE AND CONTINUE**
5. **Summary**: Klicke **BACK TO DASHBOARD**

### Schritt 4: APIs aktivieren
1. **Gmail API aktivieren**: https://console.cloud.google.com/apis/library/gmail.googleapis.com
   - Wähle Projekt `CertusFlow` → Klicke **ENABLE**
2. **Google Sheets API aktivieren**: https://console.cloud.google.com/apis/library/sheets.googleapis.com
   - Klicke **ENABLE**
3. **Google Calendar API aktivieren**: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
   - Klicke **ENABLE**

### Schritt 5: OAuth 2.0 Credentials erstellen
1. **Direktlink**: https://console.cloud.google.com/apis/credentials
2. Wähle Projekt `CertusFlow`
3. Klicke **+ CREATE CREDENTIALS** (oben) → **OAuth client ID**
4. Falls "OAuth client ID" ausgegraut ist:
   - Du musst erst den Consent Screen konfigurieren (siehe Schritt 2)
5. **Application type**: Wähle **Web application**
6. **Name**: `CertusFlow Web Client`
7. **Authorized JavaScript origins**: (leer lassen)
8. **Authorized redirect URIs**: Klicke **+ ADD URI** (3x) und füge ein:
   ```
   https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/gmail
   ```
   ```
   https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/google-sheets
   ```
   ```
   https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/google-calendar
   ```
9. Klicke **CREATE**
10. **Popup erscheint mit deinen Credentials!**
    - **Client ID**: Kopiere diese (sieht aus wie `123456789-abc.apps.googleusercontent.com`)
    - **Client Secret**: Kopiere dieses (sieht aus wie `GOCSPX-abc123xyz`)
11. Klicke **DOWNLOAD JSON** (optional, als Backup)

### Schritt 6: Credentials in .env.local speichern
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123xyz"
```

### ⚠️ Wichtig für Google:
- **Verifizierung erforderlich**: Später musst du die App verifizieren lassen, wenn mehr als 100 User sie nutzen
- **Test users**: Während der Entwicklung kannst du Test-User hinzufügen unter: https://console.cloud.google.com/apis/credentials/consent
- **Publishing status**: Deine App ist erstmal "Testing" → nur Test-User können sich anmelden

---

## 2. 🟦 **Microsoft (Outlook, OneDrive, Teams)**

### Schritt 1: Azure Portal App Registration
1. **Direktlink**: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
2. Falls du dich anmelden musst: Nutze deinen Microsoft/Outlook Account
3. Klicke **+ New registration** (oben)

### Schritt 2: App registrieren
1. **Name**: `CertusFlow`
2. **Supported account types**: Wähle:
   - ☑️ **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**
3. **Redirect URI**:
   - Platform: Wähle **Web** (Dropdown)
   - URI: `https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/outlook`
4. Klicke **Register**

### Schritt 3: Application (client) ID kopieren
1. Du bist jetzt auf der **Overview** Seite
2. Kopiere die **Application (client) ID** (sieht aus wie `12345678-1234-1234-1234-123456789abc`)
   - Das ist deine `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
3. **Lass diese Seite offen**, wir brauchen sie noch!

### Schritt 4: Weitere Redirect URIs hinzufügen
1. Klicke in der linken Sidebar auf **Authentication**
2. Unter **Web** → **Redirect URIs** klicke **Add URI** (2x):
   ```
   https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/onedrive
   ```
   ```
   https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/microsoft-teams
   ```
3. **Implicit grant**: Lasse alles deaktiviert
4. **Allow public client flows**: Setze auf **No**
5. Klicke **Save** (unten)

### Schritt 5: Client Secret erstellen
1. Klicke in der linken Sidebar auf **Certificates & secrets**
2. Unter **Client secrets** klicke **+ New client secret**
3. **Description**: `CertusFlow OAuth Secret`
4. **Expires**: Wähle **730 days (24 months)**
5. Klicke **Add**
6. **⚠️ WICHTIG**: Kopiere sofort den **Value** (nicht die "Secret ID"!)
   - Sieht aus wie: `abc~1234567890ABCdef_XYZ`
   - **Wird nur EINMAL angezeigt!**
   - Das ist dein `MICROSOFT_CLIENT_SECRET`

### Schritt 6: API Permissions hinzufügen
1. **Direktlink zur API Permissions**: Klicke in der linken Sidebar auf **API permissions**
2. Klicke **+ Add a permission**
3. Wähle **Microsoft Graph**
4. Wähle **Delegated permissions**
5. Suche und aktiviere folgende Permissions:
   
   **Mail (Outlook)**:
   - `Mail.Read` - E-Mails lesen
   - `Mail.ReadWrite` - E-Mails verwalten
   - `Mail.Send` - E-Mails senden
   
   **Files (OneDrive)**:
   - `Files.Read` - Dateien lesen
   - `Files.ReadWrite` - Dateien schreiben
   - `Files.ReadWrite.All` - Alle Dateien
   
   **Chat (Teams)**:
   - `Chat.Read` - Chats lesen
   - `Chat.ReadWrite` - Chats schreiben
   
   **User**:
   - `User.Read` - Profil lesen
   - `offline_access` - Refresh Token (wichtig!)
   
6. Klicke **Add permissions**
7. **Optional**: Klicke **Grant admin consent for [Name]** (wenn du Admin bist)
   - Sonst müssen User bei der ersten Anmeldung zustimmen

### Schritt 7: Credentials in .env.local speichern
```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="12345678-1234-1234-1234-123456789abc"
MICROSOFT_CLIENT_SECRET="abc~1234567890ABCdef_XYZ"
```

### 🔗 Wichtige Links:
- **App Overview**: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
- **Microsoft Graph Explorer** (zum Testen): https://developer.microsoft.com/en-us/graph/graph-explorer

---

## 3. 🟪 **Slack**

### Schritt 1: Slack App erstellen
1. **Direktlink**: https://api.slack.com/apps?new_app=1
2. Falls du nicht angemeldet bist: Melde dich mit deinem Slack-Account an
3. Klicke **Create New App**
4. Wähle **From scratch**
5. **App Name**: `CertusFlow`
6. **Pick a workspace to develop your app in**: Wähle deinen Workspace (z.B. "Mein Workspace")
7. Klicke **Create App**

### Schritt 2: App Credentials anzeigen
1. Du bist jetzt auf der **Basic Information** Seite
2. Scrolle zu **App Credentials**
3. Hier findest du:
   - **Client ID**: Kopiere diese (sieht aus wie `1234567890.1234567890`)
     - Das ist deine `NEXT_PUBLIC_SLACK_CLIENT_ID`
   - **Client Secret**: Klicke **Show** → Kopiere den Secret
     - Sieht aus wie: `abc123def456ghi789jkl012`
     - Das ist dein `SLACK_CLIENT_SECRET`
   - **Signing Secret**: (brauchen wir nicht für OAuth)

### Schritt 3: OAuth & Permissions konfigurieren
1. Klicke in der linken Sidebar auf **OAuth & Permissions**
2. Scrolle zu **Redirect URLs**
3. Klicke **Add New Redirect URL**
4. Füge ein: `https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/slack`
5. Klicke **Add**
6. Klicke **Save URLs**

### Schritt 4: Bot Token Scopes hinzufügen
1. Bleibe auf der **OAuth & Permissions** Seite
2. Scrolle zu **Scopes** → **Bot Token Scopes**
3. Klicke **Add an OAuth Scope** und füge hinzu:
   
   **Channels & Messages**:
   - `channels:read` - Öffentliche Kanäle anzeigen
   - `channels:history` - Nachrichten in öffentlichen Kanälen lesen
   - `chat:write` - Nachrichten als Bot senden
   - `chat:write.public` - In Kanälen schreiben ohne Mitglied zu sein
   
   **Files**:
   - `files:read` - Dateien lesen
   - `files:write` - Dateien hochladen
   
   **Incoming Webhooks**:
   - `incoming-webhook` - Webhooks posten

### Schritt 5: User Token Scopes hinzufügen (optional)
1. Unter **User Token Scopes** klicke **Add an OAuth Scope**:
   - `users:read` - User-Informationen lesen
   - `users:read.email` - User-Email lesen

### Schritt 6: App installieren
1. Scrolle nach oben zu **OAuth Tokens for Your Workspace**
2. Klicke **Install to Workspace**
3. **Authorize** die App → Du siehst die Berechtigungen
4. Klicke **Allow**
5. Du wirst zurück zur **OAuth & Permissions** Seite geleitet
6. **Bot User OAuth Token** wird angezeigt (beginnt mit `xoxb-`)
   - Diesen Token brauchst du später für API-Calls (nicht für OAuth-Flow)

### Schritt 7: Credentials in .env.local speichern
```bash
NEXT_PUBLIC_SLACK_CLIENT_ID="1234567890.1234567890"
SLACK_CLIENT_SECRET="abc123def456ghi789jkl012"
```

### 🔗 Wichtige Links:
- **Deine Apps**: https://api.slack.com/apps
- **Slack API Docs**: https://api.slack.com/docs
- **OAuth Flow Tester**: https://api.slack.com/authentication/oauth-v2

### ⚠️ Wichtig für Slack:
- **Public Distribution**: Falls du die App öffentlich machen willst, musst du sie zur **Slack App Directory** submitten
- **Development Workspace**: Aktuell funktioniert die App nur in dem Workspace, wo du sie installiert hast

---

## 4. ✅ **Dropbox** (bereits eingerichtet!)

Du hast Dropbox bereits erfolgreich eingerichtet:
```bash
NEXT_PUBLIC_DROPBOX_CLIENT_ID="p1zz1t9ivmybxem"
DROPBOX_CLIENT_SECRET="8kl0ofe1r5ifr3h"
```

---

## 📝 Vollständige .env.local Datei

Hier ist deine komplette `.env.local` mit allen Platzhaltern:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://yonvbvksvybagiwjjcgz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dein-anon-key"
SUPABASE_SERVICE_ROLE_KEY="dein-service-role-key"

# App URL (Codespaces)
NEXT_PUBLIC_APP_URL="https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev"

# Google OAuth (Gmail, Sheets, Calendar)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# Microsoft OAuth (Outlook, OneDrive, Teams)
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MICROSOFT_CLIENT_SECRET="xxxx~xxxx"

# Slack OAuth
NEXT_PUBLIC_SLACK_CLIENT_ID="xxxxxxxxxx.xxxxxxxxxx"
SLACK_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Dropbox OAuth (bereits eingerichtet)
NEXT_PUBLIC_DROPBOX_CLIENT_ID="p1zz1t9ivmybxem"
DROPBOX_CLIENT_SECRET="8kl0ofe1r5ifr3h"
```

---

## 🚀 Nach der Einrichtung

### 1. .env.local prüfen
Stelle sicher, dass alle Credentials in `/workspaces/Certusflow-App/.env.local` sind:
```bash
cat .env.local
```

### 2. Server neu starten
```bash
# Terminal stoppen (Ctrl+C)
npm run dev
```

### 3. Integration testen
1. Öffne: https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/de/dashboard/integrations
2. Klicke auf eine Integration (z.B. **Gmail**)
3. **Permission Dialog** öffnet sich
4. Wähle die gewünschten Berechtigungen aus
5. Klicke **"Berechtigungen bestätigen"**
6. Du wirst zu Google/Microsoft/Slack weitergeleitet
7. Melde dich an und erlaube die Berechtigungen
8. Du wirst zurück zur App geleitet (`/api/oauth/callback/...`)
9. Du solltest auf `/de/dashboard/integrations` landen mit Erfolgsmeldung

### 4. Verbindung prüfen
- Integration sollte als **"Verbunden"** angezeigt werden
- **Grüner Badge** mit Checkmark
- Button **"Berechtigungen"** zum Bearbeiten
- Button **"Trennen"** zum Entfernen

### 5. Fehlersuche

#### ❌ "redirect_uri_mismatch"
**Problem**: Redirect URI in OAuth-Provider stimmt nicht überein

**Lösung**:
1. Prüfe die URL in der Fehlermeldung
2. Gehe zurück zur OAuth-Konfiguration (Google/Microsoft/Slack)
3. Füge die exakte URL als Redirect URI hinzu
4. **Wichtig**: Keine Leerzeichen, keine Trailing Slashes!

#### ❌ "invalid_client"
**Problem**: Client ID oder Client Secret falsch

**Lösung**:
1. Prüfe `.env.local` auf Tippfehler
2. Kopiere die Credentials erneut aus der Console
3. Stelle sicher, dass keine Leerzeichen am Anfang/Ende sind
4. Server neu starten: `npm run dev`

#### ❌ "access_denied"
**Problem**: User hat Berechtigungen abgelehnt

**Lösung**:
- Versuche es erneut und klicke "Allow/Erlauben"
- Prüfe ob dein Account die nötigen Berechtigungen hat

#### ❌ Integration zeigt nicht "Verbunden"
**Problem**: Callback hat nicht funktioniert

**Lösung**:
1. Öffne Browser-Konsole (F12) → **Console Tab**
2. Schaue nach Error-Meldungen
3. Prüfe **Network Tab** → Filter auf "callback"
4. Schaue auf den Response des `/api/oauth/callback/[provider]` Requests
5. Nutze Debug-Seite: https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/de/debug-oauth

#### 🔍 Debug-Modus aktivieren
In `.env.local` hinzufügen:
```bash
NEXT_PUBLIC_DEBUG_OAUTH=true
```
Dann siehst du mehr Logs in der Konsole.

### 6. Logs prüfen
**Supabase Database Logs**:
1. Gehe zu: https://yonvbvksvybagiwjjcgz.supabase.co/project/yonvbvksvybagiwjjcgz/logs/postgres-logs
2. Filtere nach: `integrations`
3. Schaue ob INSERT/UPDATE erfolgreich war

**Server Logs** (Terminal):
- Achte auf Fehler im Terminal wo `npm run dev` läuft
- OAuth Callbacks loggen automatisch

---

## 🔐 Sicherheits-Tipps

✅ **Client Secrets niemals committen** - Nur in .env.local!
✅ **Redirect URIs exakt angeben** - Keine Wildcards
✅ **Minimal erforderliche Scopes** - Nicht mehr als nötig
✅ **Refresh Tokens verwenden** - Für dauerhafte Verbindung
✅ **Service Role Key nur im Backend** - Niemals im Frontend

---

## 📞 Support

Bei Problemen:
1. Prüfe die Browser-Konsole
2. Schau in die Supabase Logs
3. Nutze `/de/debug-oauth` für Debugging
4. Check die OAuth Callback Logs in `/app/api/oauth/callback/[provider]/route.ts`

---

## ✨ Fertig!

Sobald alle APIs eingerichtet sind, kannst du:
- ✅ Gmail E-Mails automatisch verarbeiten
- ✅ Google Sheets mit Daten befüllen
- ✅ Termine in Google Calendar erstellen
- ✅ Outlook E-Mails verwalten
- ✅ OneDrive Dateien synchronisieren
- ✅ Teams Nachrichten senden
- ✅ Slack Benachrichtigungen verschicken
- ✅ Dropbox Dokumente speichern

Viel Erfolg! 🎉
