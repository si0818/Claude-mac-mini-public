// Sendet eine Web-Push-Erinnerung, wenn die Kontaktlinsen fällig sind.
// Läuft per Cron (siehe linsen-reminder.yml); Zeitfenster: 06:00 und 20:00/21:00 Europe/Zurich.
const fs = require('fs');
const webpush = require('web-push');

const VAPID_PUBLIC_KEY = 'BGjFjIOz0iFOyZeKYBF2br7rwc3qxFuif2jmG-I6U8zR3FdB2z-2zc9QVP8SmIUDTraPcy0W_pnM5A1t7voqogg';
const STATE_FILE = 'linsen/data/state.json';
const force = process.env.FORCE === 'true';

function zurichParts() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
}

async function main() {
  if (!fs.existsSync(STATE_FILE)) {
    console.log('Kein Stand gespeichert (App noch nie mit GitHub verbunden) – nichts zu tun.');
    return;
  }
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  const { date, hour } = zurichParts();

  const eveningHour = Number(state.eveningHour) || 20;
  if (!force && hour !== 6 && hour !== eveningHour) {
    console.log(`Zürich-Stunde ${hour} ist kein Erinnerungszeitpunkt (6 oder ${eveningHour}) – Ende.`);
    return;
  }

  const wearDays = Number(state.wearDays) || 14;
  const worn = Math.round((new Date(date + 'T12:00:00Z') - new Date(state.lastChanged + 'T12:00:00Z')) / 86400000);
  if (!force && worn < wearDays) {
    console.log(`Tag ${worn} von ${wearDays} – noch nicht fällig, keine Erinnerung.`);
    return;
  }

  if (!state.subscription || !state.subscription.endpoint) {
    console.log('Keine Push-Subscription hinterlegt – in der App Benachrichtigungen aktivieren.');
    return;
  }
  if (!process.env.VAPID_PRIVATE_KEY) {
    console.error('Secret VAPID_PRIVATE_KEY fehlt im Repository (Settings → Secrets and variables → Actions).');
    process.exit(1);
  }

  webpush.setVapidDetails(
    'https://github.com/si0818/Claude-mac-mini-public',
    VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const over = worn - wearDays;
  const body = force && worn < wearDays
    ? `Test erfolgreich! Aktuell Tag ${worn} von ${wearDays}.`
    : over <= 0
      ? `Heute ist Wechseltag (Tag ${worn} von ${wearDays}). Bitte wechseln und in der App bestätigen.`
      : `Deine Linsen sind seit ${over} Tag${over === 1 ? '' : 'en'} überfällig (Tag ${worn} von ${wearDays}). Bitte wechseln und in der App bestätigen!`;

  try {
    await webpush.sendNotification(state.subscription, JSON.stringify({
      title: force && worn < wearDays ? '👁️ Linsen – Testnachricht' : '👁️ Zeit, die Linsen zu wechseln!',
      body,
      badge: Math.max(1, over)
    }), { TTL: 4 * 3600, urgency: 'high' });
    console.log('Push gesendet:', body);
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('Subscription abgelaufen – in der App Benachrichtigungen neu aktivieren.');
    } else {
      console.error('Push fehlgeschlagen:', err.statusCode, err.body || err.message);
      process.exit(1);
    }
  }
}

main();
