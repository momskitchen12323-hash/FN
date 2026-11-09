import type { Email } from '../types/email';

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

/** Parses the snapshot date stamps: "11 Oct 2026, 21:13", "19 August 2026 at 08:35". */
export function parseStamp(stamp?: string): Date | null {
  if (!stamp) return null;
  const m = stamp.match(/(\d{1,2}) ([A-Za-z]{3,9}) (\d{4})(?:[,\s]+(?:at\s+)?(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (!month) return null;
  const d = new Date(
    Number(m[3]),
    month - 1,
    Number(m[1]),
    m[4] ? Number(m[4]) : 0,
    m[5] ? Number(m[5]) : 0,
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Compact list date, Gmail-style: time for today, "Yesterday", weekday, "11 Oct", "11 Oct 2025". */
export function compactDate(d: Date | null): string {
  if (!d) return '';
  const now = new Date();
  if (sameDay(d, now)) {
    const h = d.getHours();
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${h12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  const dayDiff = (now.getTime() - d.getTime()) / 86_400_000;
  if (dayDiff < 7) return DAY_SHORT[d.getDay()];
  const short = `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? short : `${short} ${d.getFullYear()}`;
}

/** Row date; snapshot short dates are kept as-is, verbose ones become relative. */
export function rowDate(email: Email): string {
  const rawDate = (email.date || '').trim();
  if (rawDate && rawDate !== '\u2014' && rawDate !== '\u2013' && rawDate !== '-' &&
      !/(\d{1,2}) ([A-Za-z]+) (\d{4})/.test(rawDate)) {
    return rawDate; // already compact ("21:13", "2 Sept")
  }
  const parsed = parseStamp(email.fullDate);
  const rel = compactDate(parsed);
  if (rel) return rel;
  if (!rawDate || rawDate === '\u2014' || rawDate === '\u2013' || rawDate === '-') return '';
  return rawDate.split(',')[0];
}

/** Loose form for the detail header: "4 weeks ago", "Yesterday", falling back to stamp. */
export function longAgo(d: Date | null, fallback = ''): string {
  if (!d) return fallback;
  const now = new Date();
  if (sameDay(d, now)) {
    const mins = Math.max(1, Math.round((now.getTime() - d.getTime()) / 60_000));
    return mins < 60 ? `${mins} min ago` : `${Math.round(mins / 60)} hours ago`;
  }
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
