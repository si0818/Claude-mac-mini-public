# 🌬️ Atem – Tägliche Atemübungen

Eine Web-App (PWA) fürs iPhone: Lade deine eigenen MP3-Atemübungen hoch, spiele sie täglich ab und bleib mit dem Streak-Tracker motiviert.

## Funktionen

- **MP3-Upload:** Eigene Atemübungen (MP3/M4A) hochladen – sie werden **lokal auf dem iPhone** gespeichert (IndexedDB), nichts landet auf einem Server.
- **Player:** Abspielen mit Fortschrittsbalken und pulsierendem Atemkreis als visuelle Atemhilfe.
- **Automatisches Abhaken:** Hörst du eine Übung bis zum Ende, wird der Tag automatisch als erledigt markiert. Alternativ manuell per Knopf abhaken.
- **Streak-Tracker:** Flammen-Serie 🔥, Monatskalender mit Häkchen, aktuelle Serie, beste Serie und Gesamtzahl der Tage.
- **Offline-fähig:** Dank Service Worker funktioniert die App auch ohne Internet.

## Auf dem iPhone installieren

1. **App online stellen** (einmalig): Auf GitHub unter **Settings → Pages → Branch: `main` (root)** aktivieren. Die App ist dann unter `https://<username>.github.io/Claude-mac-mini/` erreichbar.
2. Diese URL auf dem iPhone in **Safari** öffnen.
3. **Teilen-Symbol** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm"** tippen.
4. Die App erscheint mit eigenem Icon auf dem Home-Bildschirm und startet im Vollbild – wie eine echte App.

## Wichtig zu wissen

- Die MP3s und dein Fortschritt sind **nur auf diesem Gerät** gespeichert. Wird die App vom Home-Bildschirm gelöscht oder Safari-Websitedaten werden gelöscht, gehen die Daten verloren.
- Die App fragt den Browser nach persistentem Speicher (`navigator.storage.persist()`), damit iOS die Daten nicht automatisch aufräumt. Am zuverlässigsten bleibt der Speicher erhalten, wenn die App **als Home-Bildschirm-App** installiert ist und regelmässig benutzt wird.
