# Dropbox OAuth Setup - Schritt für Schritt

## Problem
Fehler: "This app is not valid" bei Dropbox OAuth

## Lösung

### 1. Gehe zur Dropbox App Console
https://www.dropbox.com/developers/apps

### 2. Öffne deine App "certusflow"
- Klicke auf den App-Namen in der Liste

### 3. Füge den Redirect URI hinzu
- Scrolle zu "OAuth 2"
- Suche den Bereich "Redirect URIs"
- Füge **EXAKT** diese URL hinzu:
  ```
  https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox
  ```
- Klicke auf "Add"
- Klicke auf "Submit" (WICHTIG!)

### 4. Prüfe die App-Einstellungen

#### App Type muss sein:
- ✅ **Scoped access** (nicht "Full Dropbox")

#### Permissions müssen aktiviert sein:
- ✅ `files.content.write`
- ✅ `files.content.read`

Falls nicht:
1. Gehe zu "Permissions" Tab
2. Aktiviere die oben genannten Permissions
3. Klicke "Submit"

### 5. Development Status
- Die App muss **nicht** in Production sein
- Development-Modus erlaubt OAuth-Tests

### 6. Teste den OAuth Flow

1. Öffne https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/de/dashboard/integrations
2. Klicke bei Dropbox auf "Verbinden"
3. Du solltest zur Dropbox-Autorisierungsseite weitergeleitet werden
4. Nach Zustimmung wirst du zurück zur App geleitet
5. Die Integration sollte als "Verbunden" angezeigt werden

## Häufige Fehler

### "This app is not valid"
- ❌ Redirect URI fehlt oder ist falsch
- ✅ Lösung: Exakte URL in Dropbox Console hinzufügen

### "Invalid OAuth 2 client ID"
- ❌ Client ID falsch in .env.local
- ✅ Lösung: Prüfe Client ID in Dropbox Console → Settings

### "Invalid OAuth 2 redirect URI"
- ❌ URI in Console stimmt nicht mit Code überein
- ✅ Lösung: Beide müssen EXAKT übereinstimmen (inkl. https://)

## Aktuelle Konfiguration

**Client ID:** lkopmthbwccrgen  
**Redirect URI:** https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox  
**Scopes:** files.content.write, files.content.read

## Nach erfolgreicher Einrichtung

Die Integration wird in der Supabase-Datenbank gespeichert:
- Tabelle: `integrations`
- Felder: user_id, integration_type, access_token, refresh_token, expires_at
