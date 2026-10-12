#!/usr/bin/env python3
"""Build src/data/emails.ts from the Gmail scrape artifacts in /tmp/opencode/gmail-copy.

Sources:
  runA.json                 — 6 inbox threads (cards with open-body + optional lgPages)
  lg_saunifix2.json         — 2 SAUNIFIX multi-message threads (LG pages per message)
  runD.json                 — sent rows/threads, category rows/threads, primary rows
  all_tabs_rows.json        — fallback row metadata (category)
Thread cards carry row-level field data; LG pages carry full per-message bodies.

Output: src/data/emails.ts (TypeScript module) with ACCOUNT + INITIAL_EMAILS.
"""
from __future__ import annotations

import html as htmlmod
import json
import math
import re
from datetime import datetime

SRC = '/tmp/opencode/gmail-copy'
OUT = '/home/david/Projects/gmail-replica/src/data/emails.ts'

MONTHS = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7,
          'Aug': 8, 'Sept': 9, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12,
          'January': 1, 'February': 2, 'March': 3, 'April': 4, 'June': 6, 'July': 7,
          'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12}


def jload(name, default=None):
    try:
        return json.load(open(f'{SRC}/{name}', encoding='utf-8'))
    except Exception:
        return default


def lg_text(page: str) -> str:
    """Extract readable body text from a legacy view=lg page."""
    if not page:
        return ''
    # cut to the message domain
    m = re.search(r'class="maincontent"(.*)', page, re.S)
    if not m:
        m = re.search(r'class="message"(.*)', page, re.S | re.I)
    seg = m.group(1) if m else ''
    seg = re.sub(r'<style.*?</style>', '', seg, flags=re.S | re.I)
    seg = re.sub(r'<script.*?</script>', '', seg, flags=re.S | re.I)
    seg = seg.replace('<br>', '\n').replace('<br />', '\n').replace('<br/>', '\n')
    seg = re.sub(r'</(p|div|tr|table|blockquote)>', '\n', seg, flags=re.I)
    seg = re.sub(r'<[^>]+>', '', seg)
    txt = htmlmod.unescape(seg)
    # collapse multiple blank lines
    txt = re.sub(r'\n{2,}', '\n\n', txt)
    txt = re.sub(r'[ \t]{2,}', ' ', txt)
    return txt.strip()


def lg_fields(page: str) -> dict:
    """Extract sender/date/recipients/subject/attachments from a view=lg page."""
    p = {}
    seg = re.search(r'class="message"(.*)', page, re.S)
    seg = seg.group(1) if seg else ''
    m = re.search(r'<b>(.*?)</b>\s*&lt;([^&]+?)&gt;', seg)
    p['fromName'] = htmlmod.unescape(m.group(1)).strip() if m else None
    p['fromEmail'] = m.group(2) if m else None
    if m:
        head = seg[min(max(0, m.start() - 60), len(seg)):m.end() + 900]
        md = re.search(r'<font size=-1>(\d{1,2} \w+ \d{4} at \d{1,2}:\d{2})</font>', head)
        p['date'] = md.group(1) if md else None
    else:
        p['date'] = None
    mr = re.search(r'class="recipient"[^>]*>(.*?)</font>', seg, re.S)
    p['to'] = re.sub(r'<[^>]+>', ' ', mr.group(1)).strip() if mr else None
    ms = re.search(r'<font size=\+1>\s*<b>(.*?)</b>', page)
    p['subject'] = htmlmod.unescape(ms.group(1)) if ms else None
    # attachments: 'filename.ext (123 KB)' near Download links
    p['attachments'] = []
    for mm in re.finditer(r'>([^<>\\n]{3,120}\\.[A-Za-z0-9]{2,5})</(?:b|font|a)>\\s*(?:\\<[^>]+\\>)*\\s*\\((\\d+\\.?\\d*) (KB|MB)\\)', page):
        p['attachments'].append({'name': htmlmod.unescape(mm.group(1)).strip(), 'size': f"{mm.group(2)} {mm.group(3)}"})
    if not p['attachments']:
        for mm in re.finditer(r'>([^<>\\n]{3,120}\\.[A-Za-z0-9]{2,5})<', page):
            name = htmlmod.unescape(mm.group(1)).strip()
            if any(k in name.lower() for k in ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.xls']) or name.lower().count('attachment'):
                p['attachments'].append({'name': name})
    return p


def parse_date(field: str | None, shown: str | None = None):
    """Return a sortable timestamp for dates like '21 June 2026 at 01:33' / '2 Sept 2026, 08:48'."""
    if not field and not shown:
        return 0.0
    s = (field or shown or '').strip()
    m = re.search(r'(\\d{1,2}) (\\w+) (\\d{4})(?: at)?[ ,]+(\\d{1,2}):(\\d{2})', s)
    if not m:
        m = re.search(r'(\\d{1,2}) (\\w+) (\\d{4})[ ,]+(\\d{1,2}):(\\d{2})', s)
    if not m:
        return 0.0
    day, mon, yr, hh, mm = m.groups()
    mon = MONTHS.get(mon, MONTHS.get(mon[:3].capitalize(), None))
    if not mon:
        return 0.0
    try:
        return datetime(int(yr), int(mon), int(day), int(hh), int(mm)).timestamp()
    except Exception:
        return 0.0


def sanitize(text: str | None) -> str:
    if not text:
        return ''
    return text.replace('\r', '').replace('\\\\', '’').replace('\\n\\n' + chr(92) * 0, '')


def esc_ts(s: str) -> str:
    s = (s or '')
    s = s.replace(chr(92), chr(92) * 2).replace('’', chr(92) + '’').replace('`', chr(92) + '`').replace('$', chr(92) + '$')
    return s.replace('\n', '\\n').replace('\r', '').replace('"', chr(92) + '"')


rows_inbox = jload('runD.json', {}).get('primary_rows') or jload('all_tabs_rows.json', {}).get('Primary') or []
rows_sent = jload('runD.json', {}).get('sent_rows') or []
cats = (jload('runD.json', {}) or {}).get('categories') or {}
cat_rows = {k[:-5]: v for k, v in cats.items() if k.endswith('_rows')}
runA = jload('runA.json') or {}
lg_sauni = jload('lg_saunifix2.json') or {}
sent_threads = (jload('runD.json', {}) or {}).get('sent_threads') or {}

emails: list[dict] = []


def thread_from_lg(pages, perms) -> list[dict]:
    msgs = []
    for i, pg in enumerate(pages):
        f = lg_fields(pg)
        txt = lg_text(pg)
        msg = {
            'fromName': f.get('fromName'),
            'fromEmail': f.get('fromEmail'),
            'date': f.get('date'),
            'body': txt,
            'attachments': f.get('attachments') or [],
        }
        msgs.append(msg)
    return msgs


def sort_msgs(msgs):
    try:
        return sorted(msgs, key=lambda m: parse_date(m.get('date')))
    except Exception:
        return msgs


def attach_union(msgs):
    seen = {}
    for m in msgs:
        for a in (m.get('attachments') or []):
            seen.setdefault(a['name'], a)
    return list(seen.values())


def avatar_for_name(msgs):
    for m in msgs:
        if m.get('fromEmail') and 'mkhizemksi' not in (m.get('fromEmail') or ''):
            pass
    return None


# ---- INBOX threads ----
out_inbox = []
inbox_ids = []
for row in rows_inbox:
    tid = row.get('th')
    if tid and tid not in inbox_ids:
        inbox_ids.append(tid)

for i, row in enumerate(rows_inbox):
    tid = row.get('th')
    if not tid:
        continue
    lg = (lg_sauni.get('pages') or {}).get(tid)
    perms = (lg_sauni.get('perms') or {}).get(tid)
    msgs = []
    if lg:
        msgs = thread_from_lg(lg.get('pages') or [], perms)
    if not msgs:
        a = (runA.get(tid) or {}).get('cards') or []
        for c in a:
            if (c.get('body') or '').strip():
                msgs.append({
                    'fromName': c.get('from'), 'fromEmail': c.get('fromEmail'),
                    'date': c.get('date'), 'body': c.get('body'),
                    'attachments': (c.get('atts') or []),
                })
    msgs = sort_msgs(msgs)
    atts = attach_union(msgs)
    # row display name (Gmail list sender cell keeps counts like "me 12")
    display = row.get('sender') or row.get('senderDisplay') or ''
    emails.append({
        'id': tid,
        'folder': 'inbox',
        'category': 'primary',
        'fromName': display.strip(),
        'fromEmail': (msgs[0].get('fromEmail') if msgs else None),
        'toName': 'me',
        'toEmail': None,
        'subject': row.get('subj'),
        'snippet': row.get('afn') or (msgs[-1].get('body')[:120] if msgs else ''),
        'attachments': atts,
        'messages': msgs,
        'date': row.get('date'),
        'fullDate': msgs[-1].get('date') if msgs else None,
        'unread': bool(row.get('unread')),
        'starred': (row.get('starred') == 'Starred'),
        'avatarColor': '#a4c2f4' if 'mail' in json.dumps(msgs)[:10] else '#a4c2f4',
    })

# ---- SENT threads ----
for row in rows_sent:
    tid = row.get('th')
    if not tid:
        continue
    st = sent_threads.get(tid) or {}
    cards = st.get('cards') or []
    msgs = []
    for pg, c in zip(st.get('lgPages') or [], cards):
        f = lg_fields(pg)
        # fallback: carrier card field data
        msgs.append({
            'fromName': f.get('fromName') or c.get('from'),
            'fromEmail': f.get('fromEmail') or c.get('fromEmail'),
            'date': f.get('date') or c.get('date'),
            'body': lg_text(pg),
            'attachments': f.get('attachments') or [],
            'to': f.get('to'),
        })
    msgs = sort_msgs(msgs)
    to_first = (msgs[0].get('to') or 'Unknown') if msgs else 'Unknown'
    # Sent rows show "To: NAME"
    display = row.get('sender') or row.get('senderDisplay') or to_first
    emails.append({
        'id': tid,
        'folder': 'sent',
        'category': 'primary',
        'fromName': display.strip(),
        'fromEmail': None,
        'toName': re.sub(r'^To:\\s*', '', to_first).strip(),
        'toEmail': None,
        'subject': row.get('subj'),
        'snippet': row.get('afn') or '',
        'attachments': attach_union(msgs),
        'messages': msgs,
        'date': row.get('date'),
        'fullDate': msgs[-1].get('date') if msgs else None,
        'unread': False,
        'starred': False,
        'avatarColor': '#a4c2f4',
    })

# ---- CATEGORY threads (Promotions/Social/Updates) ----
cat_meta = {k: v for k, v in cats.items() if ':' in k}
for key, val in cat_meta.items():
    label, tid = key.split(':', 1)
    row = next((r for r in cat_rows.get(label) or [] if r.get('th') == tid), None)
    cards = val.get('cards') or []
    msgs = []
    for pg, c in zip(val.get('lgPages') or [], cards):
        f = lg_fields(pg)
        msgs.append({
            'fromName': f.get('fromName') or c.get('from'),
            'fromEmail': f.get('fromEmail') or c.get('fromEmail'),
            'date': f.get('date') or c.get('date'),
            'body': lg_text(pg),
            'attachments': f.get('attachments') or [],
        })
    msgs = sort_msgs(msgs)
    display = (row.get('sender') or '') if row else (msgs[0].get('fromName') or '') if msgs else ''
    catkey = {'Promotions': 'promotions', 'Social': 'social', 'Updates': 'updates'}.get(label, 'primary')
    emails.append({
        'id': tid,
        'folder': 'inbox',
        'category': catkey,
        'fromName': display.strip(),
        'fromEmail': (msgs[0].get('fromEmail') if msgs else None),
        'toName': 'me',
        'toEmail': None,
        'subject': (row.get('subj') if row else None) or (msgs[0].get('fromName') or '') if msgs else None,
        'snippet': (row.get('afn') or '') if row else '',
        'attachments': attach_union(msgs),
        'messages': msgs,
        'date': (row.get('date') if row else None),
        'fullDate': msgs[-1].get('date') if msgs else None,
        'unread': bool(row.get('unread')) if row else False,
        'starred': False,
        'avatarColor': '#a4c2f4',
    })

print('emails:', len(emails))
for e in emails:
    print(e['folder'], e['category'][:4], (e['fromName'] or '')[:22].ljust(22), '|', (e['subject'] or '')[:40], '| bodies',
          sum(1 for m in e['messages'] if (m.get('body') or '').strip()), '/', len(e['messages']), '| atts', len(e['attachments']))

# ts literal writer
def ts_email(e, idx):
    import json as _j

    def L(x):
        if x is None:
            return 'null'
        if isinstance(x, (int, float, bool)):
            return _j.dumps(x)
        return _j.dumps(x)

    def obj_msg(m):
        parts = [
            "fromName: " + L((m.get('fromName') or 'UnkНown').strip()),
            "fromEmail: " + L(m.get('fromEmail')),
            "date: " + L(m.get('date')),
            "body: " + L((m.get('body') or '').strip()),
            "attachments: " + L(m.get('attachments') or []),
        ]
        return '{ ' + ', '.join(parts) + ' }'

    msg_list = '[' + ', '.join(obj_msg(m) for m in e['messages']) + ']'
    return "  { id: '" + e['id'] + "', folder: '" + e['folder'] + "', category: '" + (e['category'] or 'primary') + "'" + \
           ", fromName: " + L(e['fromName']) + ", fromEmail: " + L(e['fromEmail']) + ", toName: " + L(e['toName']) + ", toEmail: null" + \
           ", subject: " + L(e['subject']) + ", snippet: " + L(e['snippet']) + ", attachments: " + L(e['attachments']) + \
           ", messages: " + msg_list + ", date: " + L(e['date']) + ", fullDate: " + L(e['fullDate']) + \
           ", unread: " + ('true' if e['unread'] else 'false') + ", starred: " + ('true' if e['starred'] else 'false') + " },"


banner = """
/**
 * REAL mailbox snapshot for Sihle Mkhize <mkhizemksihle@gmail.com> — scraped
 * locally from the account owner's own browser session (no backend). The data
 * below belongs to the account owner and stays inside this demo.
 */
import type { Email } from '../types/email';

export const ACCOUNT = {
  name: 'Sihle Mkhize',
  email: 'mkhizemksihle@gmail.com',
};

export const ACCOUNT_COLOR = '#DB4437';

export const INITIAL_EMAILS: Email[] = [
"""

tail = "];\n"
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(banner + '\n'.join(ts_email(e, i) for i, e in enumerate(emails)) + '\n' + tail)
print('WROTE', OUT)
