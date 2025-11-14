# 🔴 DRINGEND: Dropbox OAuth Fehler beheben

## Der Fehler
```
This app is not valid
```

## Ursache
Der **Redirect URI** ist nicht in der Dropbox App Console eingetragen!

---

## ✅ Lösung - Schritt für Schritt

### Schritt 1: Öffne Dropbox Developers Console
👉 **https://www.dropbox.com/developers/apps**

### Schritt 2: Finde deine App
- Du solltest eine App namens **"certusflow"** oder ähnlich sehen
- Klicke auf den App-Namen

### Schritt 3: Scrolle zu "OAuth 2"
- Suche den Abschnitt **"Redirect URIs"**

### Schritt 4: Füge EXAKT diese URL hinzu
```
https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox
```

**WICHTIG:**
- ✅ Muss mit `https://` beginnen (nicht `http://`)
- ✅ Keine Leerzeichen am Anfang oder Ende
- ✅ Keine zusätzlichen Parameter

### Schritt 5: Speichern
- Klicke auf **"Add"** (neben dem Textfeld)
- Klicke auf **"Submit"** (ganz unten auf der Seite)

### Schritt 6: Prüfe weitere Einstellungen

#### App Type muss sein:
- ✅ **Scoped access** 
- ❌ NICHT "Full Dropbox"

Falls falsch: Du kannst den App Type nicht ändern. Du musst eine neue App erstellen mit "Scoped access".

#### Permissions Tab:
1. Klicke auf **"Permissions"** Tab
2. Aktiviere:
   - ✅ `files.content.write`
   - ✅ `files.content.read`
3. Klicke **"Submit"**

---

## 🧪 Teste danach

1. Gehe zu: https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/de/dashboard/integrations
2. Klicke bei **Dropbox** auf **"Verbinden"**
3. Du solltest zur Dropbox-Seite weitergeleitet werden
4. Autorisiere die App
5. Du wirst zurück zur Integrations-Seite geleitet
6. Status sollte **"Verbunden"** sein ✅

---

## 📸 Screenshot Referenz

Die "Redirect URIs" Sektion sollte so aussehen:

```
OAuth 2
  ├── Redirect URIs
  │   ├── https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox
  │   └── [Add] [Submit]
```

---

## ❓ Häufige Probleme

### "Add" Button ist ausgegraut
- Du bist nicht eingeloggt oder hast keine Berechtigung
- Lösung: Logout + Login bei Dropbox

### "This app is not valid" erscheint weiterhin
- Redirect URI stimmt nicht EXAKT überein
- Lösung: Kopiere die URL aus dieser Anleitung (nicht abtippen!)
- Prüfe auf Tippfehler

### "Invalid OAuth 2 redirect_uri"
- Du hast vergessen auf "Submit" zu klicken
- Lösung: Gehe zurück zur Console und klicke "Submit"

---

## 🆘 Wenn nichts funktioniert

**Option 1: Erstelle neue Dropbox App**

1. Gehe zu https://www.dropbox.com/developers/apps/create
2. Wähle:
   - API: **Scoped access**
   - Access: **Full Dropbox** oder **App folder** (egal)
   - Name: `certusflow-oauth` (oder ähnlich)
3. Klicke **"Create app"**
4. Notiere die neue **App key** und **App secret**
5. Füge Redirect URI hinzu (siehe oben)
6. Aktualisiere `.env.local`:
   ```bash
   NEXT_PUBLIC_DROPBOX_CLIENT_ID=neue_app_key
   DROPBOX_CLIENT_SECRET=neue_app_secret
   ```
7. Starte Server neu: `npm run dev`

**Option 2: Screenshot schicken**

Mache einen Screenshot von:
1. Der Dropbox App Settings Seite
2. Dem "OAuth 2" Bereich mit "Redirect URIs"

Dann kann ich dir genau sagen, was falsch ist.

---

## ℹ️ Technische Details

**Deine aktuelle Konfiguration:**
- Client ID: `lkopmthbwccrgen`
- Redirect URI: `https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox`
- Scopes: `files.content.write files.content.read`

**Was passiert beim OAuth Flow:**
1. User klickt "Verbinden"
2. App leitet zu Dropbox weiter mit `redirect_uri` Parameter
3. Dropbox prüft: Ist dieser `redirect_uri` in der App registriert?
4. ❌ NEIN → "This app is not valid"
5. ✅ JA → User kann App autorisieren

**Warum der Fehler?**
Dropbox findet `https://cautious-waddle-wj6rpvv76jw39x5q-3000.app.github.dev/api/oauth/callback/dropbox` nicht in der Liste der erlaubten Redirect URIs deiner App.

**Die Lösung:**
Füge die URL zur Liste hinzu in der Dropbox Console!
