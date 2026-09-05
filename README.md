# Meine iPhone-Apps

Zwei Web-Apps (PWAs) fürs iPhone, gehostet über GitHub Pages:

| App | URL | Zweck |
|---|---|---|
| 🌬️ **Atem** | `https://si0818.github.io/Claude-mac-mini-public/` | Tägliche Atemübungen mit MP3s und Streak-Tracker |
| 👁️ **Linsen** | `https://si0818.github.io/Claude-mac-mini-public/linsen/` | Erinnert ans Wechseln der Kontaktlinsen |

---

# 🌬️ Atem – Tägliche Atemübungen

Eine Web-App (PWA) fürs iPhone: Lade deine eigenen MP3-Atemübungen hoch, spiele sie täglich ab und bleib mit dem Streak-Tracker motiviert.

## Funktionen

- **MP3-Upload:** Eigene Atemübungen (MP3/M4A) hochladen – sie werden **lokal auf dem iPhone** gespeichert (IndexedDB), nichts landet auf einem Server.
- **Player:** Abspielen mit Fortschrittsbalken und pulsierendem Atemkreis als visuelle Atemhilfe.
- **Automatisches Abhaken:** Hörst du eine Übung bis zum Ende, wird der Tag automatisch als erledigt markiert. Alternativ manuell per Knopf abhaken.
- **Streak-Tracker:** Flammen-Serie 🔥, Monatskalender mit Häkchen, aktuelle Serie, beste Serie und Gesamtzahl der Tage.
- **Offline-fähig:** Dank Service Worker funktioniert die App auch ohne Internet.

## Auf dem iPhone installieren

1. **App online stellen** (einmalig): Auf GitHub unter **Settings → Pages** bei „Deploy from a branch" den Standard-Branch mit Ordner `/ (root)` auswählen und speichern. Die App ist danach unter `https://<username>.github.io/Claude-mac-mini/` erreichbar.
2. Diese URL auf dem iPhone in **Safari** öffnen.
3. **Teilen-Symbol** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm"** tippen.
4. Die App erscheint mit eigenem Icon auf dem Home-Bildschirm und startet im Vollbild – wie eine echte App.

## Wichtig zu wissen

- Die MP3s und dein Fortschritt sind **nur auf diesem Gerät** gespeichert. Wird die App vom Home-Bildschirm gelöscht oder Safari-Websitedaten werden gelöscht, gehen die Daten verloren.
- Die App fragt den Browser nach persistentem Speicher (`navigator.storage.persist()`), damit iOS die Daten nicht automatisch aufräumt. Am zuverlässigsten bleibt der Speicher erhalten, wenn die App **als Home-Bildschirm-App** installiert ist und regelmässig benutzt wird.

---

# 👁️ Linsen – Wechsel-Erinnerung

Erinnert dich zuverlässig daran, deine Kontaktlinsen zu wechseln – mit echten Push-Benachrichtigungen aufs iPhone.

## So funktioniert es

- In den **Einstellungen** legst du die Tragedauer fest (z. B. 14 Tage).
- Die App zeigt einen Fortschrittsring: wie lange die Linsen schon im Einsatz sind und wann der Wechsel fällig ist.
- Ist der Wechsel fällig, bekommst du **jeden Tag um 06:00 und um 20:00 (oder 21:00) eine Push-Benachrichtigung** – so lange, bis du in der App auf **„Linsen gewechselt ✓"** tippst. Dann startet der Zähler neu.
- Ein Verlauf zeigt deine letzten Wechsel.

## Architektur

- **App:** statische PWA unter `linsen/` (GitHub Pages), Stand wird lokal gespeichert.
- **Erinnerungs-Dienst:** Der GitHub-Actions-Workflow `linsen-reminder.yml` läuft morgens und abends (Cron, Europe/Zurich), liest den Stand aus `linsen/data/state.json` und sendet bei Fälligkeit eine Web-Push-Nachricht (VAPID) an dein iPhone.
- **Sync:** Die App schreibt ihren Stand (Wechseldatum, Tragedauer, Push-Subscription) über die GitHub-API in `linsen/data/state.json`. Dafür braucht sie einmalig ein Fine-grained-Token – es bleibt ausschliesslich auf deinem Gerät (localStorage).

## Einmalige Einrichtung

1. **Repo-Secret anlegen:** Settings → Secrets and variables → Actions → *New repository secret*, Name `VAPID_PRIVATE_KEY` (Wert: der private VAPID-Schlüssel, den du erhalten hast).
2. **Token erstellen:** GitHub → Settings → Developer settings → *Fine-grained personal access tokens* → *Generate new token*. Repository access: **nur dieses Repo**; Permissions: **Contents: Read and write** und **Actions: Read and write**. Ablaufdatum grosszügig wählen.
3. **App installieren:** `https://si0818.github.io/Claude-mac-mini-public/linsen/` in Safari öffnen → Teilen → **„Zum Home-Bildschirm"** (Push funktioniert auf iOS nur in der installierten App, ab iOS 16.4).
4. In der installierten App: Token einfügen → **Verbinden**, dann **„Benachrichtigungen aktivieren"** und die Berechtigung erlauben.
5. Optional: **„Test-Benachrichtigung senden"** – nach ca. einer Minute sollte ein Push ankommen.

## Hinweis

Der Stand in `linsen/data/state.json` ist im öffentlichen Repo einsehbar (Wechseldatum, Tragedauer, Push-Endpunkt – keine sensiblen Daten). Push-Nachrichten können nur mit dem privaten VAPID-Schlüssel (Repo-Secret) gesendet werden. GitHub-Cron kann sich um einige Minuten verzögern; die Erinnerung kommt dann entsprechend später.
