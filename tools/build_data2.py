#!/usr/bin/env python3
"""Deterministic builder v3: row metadata hard-locked to the user's real Gmail.
Message bodies come from the legacy view=lg pages stored in /tmp/opencode/gmail-copy."""
from __future__ import annotations

import html as htmlmod
import json
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


def lg_parse(page: str) -> dict:
    """Parse one legacy view=lg page into message fields (robust body fetch)."""
    p = {'fromName': None, 'fromEmail': None, 'date': None, 'subject': None, 'to': None, 'attachments': [], 'body': ''}
    if not page:
        return p
    i = page.find('class="message"')
    seg = page[i:] if i > -1 else page

    m = re.search(r'<b>(.*?)</b>\s*&lt;([^&]+?)&gt;', seg)
    if m:
        p['fromName'] = htmlmod.unescape(m.group(1)).strip()
        p['fromEmail'] = htmlmod.unescape(m.group(2)).strip()
    md = re.search(r'<font size=-1>(\d{1,2} \w+ \d{4} at \d{1,2}:\d{2})</font>', seg)
    p['date'] = md.group(1) if md else None
    mr = re.search(r'class="recipient"[^>]*>(.*?)</font>', seg, re.S)
    if mr:
        raw = htmlmod.unescape(re.sub(r'<[^>]+>', ' ', mr.group(1)))
        to_part = raw.split('Cc:')[0].strip()
        to_part = re.sub(r'^To:\s*', '', to_part)
        name_part = to_part.split('<')[0].strip().replace('"', '')
        p['to'] = name_part if name_part else to_part.strip().replace('"', '')

    ms = re.search(r'<font size=\+1>\s*<b>(.*?)</b>', page)
    p['subject'] = htmlmod.unescape(ms.group(1)) if ms else None

    # body: from the padded body table until the attachment table (or end)
    bi = seg.find('cellpadding="12"')
    body_seg = seg[bi:] if bi > -1 else ''
    if not body_seg:
        bd = re.search(r'<div dir="ltr">(.*?)$', seg, re.S)
        body_seg = bd.group(1) if bd else ''
    body_html = body_seg
    ai = body_html.find('class="att"')
    if ai > -1:
        body_html = body_html[:ai]

    body_html = body_html.replace('<br>', '\n').replace('<br />', '\n').replace('<br/>', '\n')
    body_html = re.sub(r'</(p|div|tr|table|blockquote|b|font)>', '\n', body_html, flags=re.I)
    body_html = re.sub(r'<[^>]+>', '', body_html)
    txt = htmlmod.unescape(body_html)
    # drop gmail banners/disclaimer tails
    for kill in ["You don't often get email from"]:
        k = txt.find(kill)
        if k > -1:
            nl = txt.find('\n', k)
            txt = txt[:k] + (txt[nl + 1:] if nl > -1 else '')
    cut = txt.find('CAUTION: This email originated')
    if cut > -1:
        txt = txt[:cut]
    txt = re.sub(r'\nThe integrity and confidentiality of this email[\s\S]*', '', txt)
    txt = re.sub(r'\n{2,}', '\n\n', txt)
    txt = re.sub(r'[ \t]{3,}', ' ', txt)
    p['body'] = re.sub(r'[\xa0]', ' ', txt).strip()

    att = seg.find('class="att"')
    if att > -1:
        aseg = seg[att:att + 6000]
        for mm in re.finditer(r'<b>([^<]+\.(?:pdf|png|jpg|jpeg|gif|docx?|xlsx?|zip|mp4|html))</b><br/>(\d+\.?\d*\s*[KM]?)', aseg, re.I):
            p['attachments'].append({'name': htmlmod.unescape(mm.group(1)).strip(), 'size': mm.group(2).strip()})
    return p




def parse_dt(field):
    """Robust date key: '21 June 2026 at 01:33' / '19 August 2026 at 08:30'."""
    if not field:
        return 0
    try:
        m = re.search(r'(\d{1,2}) (\w+) (\d{4}) at (\d{1,2}):(\d{2})', str(field))
        if not m:
            return 0
        d, mo, y, h, mi = m.groups()
        k = MONTHS.get(mo, MONTHS.get(mo[:3], 0))
        if not k:
            return 0
        return datetime(int(y), int(k), int(d), int(h), int(mi)).timestamp()
    except Exception:
        return 0

INBOX_ROWS = [
    {'thr': '1a12c62bac8011b2', 'sender': 'Google', 'subj': '✅ Sihle, finish setting up your Linux with Google', 'snippet': 'Finish your setup.', 'date': '21:13', 'unread': True, 'starred': False, 'chips': []},
    {'thr': '1a12c61cac39aaba', 'sender': 'Google', 'subj': 'Security alert', 'snippet': 'A new sign-in on Linux mkhizemksihle@gmail.com We n…', 'date': '21:12', 'unread': True, 'starred': False, 'chips': []},
    {'thr': '1a060e00fc6dccee', 'sender': 'Mfeka, TD, Mr [tkmf.', 'subj': 'RE: CDC hearing (Prt3) - Mhlanga', 'snippet': 'Dear All, Please kindly note that the hearing will commence at 10h15. Regards, Thokozani Mfeka (TK) MManSc…', 'date': '2 Sept', 'unread': False, 'starred': False, 'chips': ['image001.png']},
    {'thr': '1a060cf3da443241', 'sender': 'Mbanga, MN, Mr [mih.', 'subj': 'CDC Hearing - Kwanele Mhlanga', 'snippet': 'Dear Mr Mkhize, This email refers to the above and our telephonic conversations. As discussed, the meeting…', 'date': '2 Sept', 'unread': False, 'starred': False, 'chips': ['image.png']},
    {'thr': '1a037a7405676f7f', 'sender': 'Mfeka, TD, Mr [tkmf.', 'subj': 'CDC hearing (Prt3) - Mhlanga', 'snippet': 'Microsoft Teams meeting Join: https://teams.microsoft.com/meet/3…', 'date': '25 Aug', 'unread': False, 'starred': False, 'chips': ['image001.png']},
    {'thr': '1a00f92055c53556', 'sender': 'tkmfeka@sun.ac.za', 'subj': 'CDC hearing - Mhlanga', 'snippet': 'Microsoft Teams meeting Join: https://teams.microsoft.com/meet/3432…', 'date': '17 Aug', 'unread': False, 'starred': False, 'chips': ['image001.png']},
    {'thr': '19f6b77312bc83fb', 'sender': 'me, P, 6', 'subj': 'Following up', 'snippet': '---------- Forwarded message --------- From: Beresford, P, Mnr [pb2@sun.ac.za] <pb2@sun.ac.za> Date: Fri, 17 Jul…', 'date': '17 Aug', 'unread': False, 'starred': False, 'chips': []},
    {'thr': '19f39a107c530dd7', 'sender': 'Google', 'subj': 'New privacy settings for Search services', 'snippet': 'mkhizemksihle@gmail.com Hello Sihle, We are updating our…', 'date': '7 Jul', 'unread': False, 'starred': False, 'chips': ['image.png']},
    {'thr': '19f1d42a5394529c', 'sender': 'me, P, 6', 'subj': 'Request', 'snippet': '---------- Forwarded message --------- From: Beresford, P, Mnr [pb2@sun.ac.za] <pb2@sun.ac.za> Date: Fri, 03 Jul…', 'date': '3 Jul', 'unread': False, 'starred': False, 'chips': ['Bundle B - Mhla….pdf', 'C.pdf', 'A.pdf']},
    {'thr': '19f07a721b284056', 'sender': 'Google', 'subj': 'Find out more about our updated Terms of Service', 'snippet': 'mkhizemksihle@gmail.com Every couple of years, we update…', 'date': '27 Jun', 'unread': False, 'starred': False, 'chips': ['image.png']},
    {'thr': '19ee74fdae9b4760', 'sender': 'SAUNIFIX, me 12', 'subj': 'Application Successful', 'snippet': '---------- Forwarded message --------- From: Sihle Mkhize <mkhizemksihle@gmail.com> Date: Thu, 16 Jul 2026 at 16:58…', 'date': '21 Jun', 'unread': False, 'starred': True, 'chips': ['2026 IDC Historic….pdf', 'APPROVED 202….pdf']},
    {'thr': '19ee52cb1f726cc2', 'sender': 'me, SAUNIFIX 10', 'subj': 'Inquiry', 'snippet': '---------- Forwarded message --------- From: SAUNIFIX <saunifix@gmail.com> Date: Sun, 18 Jan 2026 at 12:24…', 'date': '20 Jun', 'unread': False, 'starred': True, 'chips': []},
]

promo_social = [
    {'id': 'pr0', 'sender': 'TikTok', 'subj': 'Sponsored·Limited Period Ad Credit Offer', 'snippet': 'Limited Period Ad Credit Offer', 'category': 'promotions'},
    {'id': 'pr1', 'sender': 'Huntress', 'subj': 'Sponsored·Get Free NFR Huntress Licenses', 'snippet': 'Get Free NFR Huntress Licenses', 'category': 'promotions'},
    {'id': 'so0', 'sender': 'BytePlus', 'subj': 'Sponsored·ByteDance GLM-5.3 Smart Coding', 'snippet': 'ByteDance GLM-5.3 Smart Coding', 'category': 'social'},
    {'id': 'so1', 'sender': 'Discovery Insure', 'subj': 'Sponsored·Car Insurance from Discovery', 'snippet': 'Car Insurance from Discovery', 'category': 'social'},
]

runA = jload('runA.json') or {}
lg_sauni = jload('lg_saunifix2.json') or {}
runF = jload('runF.json') or {}

emails = []

for row in INBOX_ROWS:
    tid = row['thr']
    msgs = []
    if tid in (lg_sauni.get('pages') or {}):
        widgets = (lg_sauni.get('perms') or {}).get(tid) or []
        page_list = (lg_sauni.get('pages') or {}).get(tid) or []
        for page in page_list:
            f = lg_parse(page)
            msgs.append(f)
        # carry the widget metadata where parse failed
        if len(msgs) == len(widgets):
            for f, w in zip(msgs, widgets):
                f['fromName'] = f['fromName'] or w.get('who')
                f['date'] = f['date'] or w.get('date')
    else:
        data = (runA.get(tid) or {}).get('cards') or []
        seen = set()
        for c in data:
            if (c.get('body') or '').strip():
                keyc = (c.get('from') or '') + (c.get('date') or '')
                if keyc in seen:
                    continue
                seen.add(keyc)
                msgs.append({'fromName': c.get('from'), 'fromEmail': c.get('fromEmail'), 'date': c.get('date'),
                             'body': c.get('body'),
                             'attachments': c.get('atts') or []})
    msgs = sorted(msgs, key=lambda f: parse_dt(f.get('date')))
    att_union = []
    for f in msgs:
        for a in f.get('attachments') or []:
            if not any(x['name'] == a['name'] for x in att_union):
                att_union.append(a)
    if len(att_union) < len(row['chips']) and row['chips']:
        for ch in row['chips']:
            if not any(x['name'].startswith(ch.split('.')[0][:12]) for x in att_union):
                att_union.append({'name': ch})
    emails.append({
        'id': tid,
        'folder': 'inbox',
        'category': 'primary',
        'fromName': row['sender'],
        'fromEmail': msgs[0].get('fromEmail') if msgs else None,
        'subject': row['subj'],
        'snippet': row['snippet'],
        'attachments': att_union,
        'messages': msgs,
        'date': row['date'],
        'fullDate': msgs[-1].get('date') if msgs else None,
        'unread': row['unread'],
        'starred': row['starred'],
        'avatarColor': '#a4c2f4',
    })

# SENT threads (LG pages fetched through the canonical hash)
for key, v in (runF.get('sent_lg') or {}).items():
    pages = v.get('pages') or []
    msgs = [lg_parse(pg) for pg in pages]
    msgs = sorted(msgs, key=lambda f: parse_dt(f.get('date')))
    to_names = []
    for mm in msgs:
        to = mm.get('to') or ''
        to = re.sub(r'<[^>]*>', '', to)
        to_names.append(to.split(',')[0].strip())
    display_recipient = next((t for t in reversed(to_names) if t), 'Unknown')
    emails.append({
        'id': 's' + v.get('canon', '')[:14],
        'folder': 'sent',
        'category': 'primary',
        'fromName': 'To: ' + display_recipient,
        'fromEmail': 'mkhizemksihle@gmail.com',
        'toName': display_recipient,
        'subject': msgs[0].get('subject') if msgs else None,
        'snippet': (msgs[0].get('body') or '')[:140],
        'attachments': [],
        'messages': msgs,
        'date': msgs[-1].get('date') if msgs else None,
        'fullDate': msgs[0].get('date') if msgs else None,
        'unread': False,
        'starred': False,
        'avatarColor': '#a4c2f4',
    })

for s in promo_social:
    emails.append({
        'id': s['id'],
        'folder': 'inbox',
        'category': s['category'],
        'fromName': s['sender'],
        'fromEmail': None,
        'subject': s['subj'],
        'snippet': s['snippet'],
        'attachments': [],
        'messages': [{'fromName': s['sender'], 'fromEmail': None, 'date': None, 'body': 'Sponsored content — open in Gmail to read the full advertisement.', 'attachments': []}],
        'date': None,
        'fullDate': None,
        'unread': True,
        'starred': False,
        'avatarColor': '#a4c2f4',
    })

print('total emails:', len(emails))

# normalise string/null-ness so the TS types all hold
def S(x, d=''):
    return (str(x) if x is not None else d).strip() or d

for e in emails:
    e['fromName'] = S(e['fromName'], 'Unknown')
    e['subject'] = S(e['subject'], '(No subject)')
    e['snippet'] = S(e['snippet'])[:180]
    e['date'] = S(e['date'], '—')
    e['fullDate'] = S(e['fullDate'], e['date'])
    e['toName'] = S(e.get('toName'), 'me')
    # separate 'To: To: X' artifacts
    e['fromName'] = re.sub(r'^(To:\s*)+', '', e['fromName'])
    if e['folder'] == 'sent':
        # row shows "To:NAME" without second To:
        if not e['fromName'].startswith('To:'):
            e['fromName'] = 'To: ' + e['fromName']
    e['attachments'] = [a for a in e['attachments'] if isinstance(a, dict) and a.get('name')]
    e['messages'] = [m for m in e['messages'] if True]
    for m in e['messages']:
        clean = [a for a in (m.get('attachments') or []) if isinstance(a, dict) and a.get('name')]
        m['attachments'] = clean
        body = (m.get('body') or '').lstrip()
        # drop leading 'To: ...' artifact line
        body = re.sub(r'^To:[^\n]*\n\n?', '', body)
        # drop a leading echo of the subject line
        subj = (e['subject'] or '').strip()
        if subj and body.lower().startswith(subj.lower()[:40].strip()):
            after = body[len(subj):]
            if 'IDC' in after or 'To:' in after or after.startswith('SAUNIFIX'):
                body = after.lstrip()
        m['body'] = body.strip()
        if m.get('fromName') in (None, '', 'Unknown'):
            m['fromName'] = 'Unknown'
    seenA = []
    for a in e['attachments']:
        if a['name'] not in [x['name'] for x in seenA]:
            seenA.append(a)
    e['attachments'] = seenA
    for m in e['messages']:
        m['fromName'] = S(m.get('fromName'), 'Unknown')
        m['fromEmail'] = S(m.get('fromEmail'), 'unknown@localhost')
        m['date'] = S(m.get('date'), '—')
        m['body'] = S(m.get('body'))
        m['attachments'] = [a for a in (m.get('attachments') or []) if isinstance(a, dict) and a.get('name')]
        
for e in emails[:13]:
    print((e['id'] or '')[:12], '|', (e['fromName'] or '')[:22].ljust(22), '|', (e['subject'] or '')[:36], '| msgs', len(e['messages']), '| atts', len(e['attachments']))


def L(x):
    import json as _j
    if x is None:
        return 'null'
    if isinstance(x, (int, float, bool)):
        return _j.dumps(x)
    if isinstance(x, list):
        return '[' + ', '.join(L(xi) for xi in x) + ']'
    if isinstance(x, dict):
        fields = []
        if x.get('name') is not None:
            fields.append('name: ' + L(x.get('name')))
        if x.get('size') is not None:
            fields.append('size: ' + L(x.get('size')))
        return '{ ' + ', '.join(fields) + ' }' if fields else '{ }'
    s = str(x).replace('’', "'").replace('”', '"').replace('“', '"')
    import json as _j
    return _j.dumps(s)


runG_lg = jload('runG_lg.json') or {}
runF_all = jload('runF.json') or {}
sent_lg_all = runF_all.get('sent_lg') or {}

for e in emails:
    tid = e['id']
    if tid in runG_lg and len(e['messages']) == 0:
        data = runG_lg[tid] or {}
        msgs = []
        for pg, bd in zip(data.get('lgPages') or [], data.get('bodyData') or []):
            f = lg_parse(pg)
            if not (f.get('body') or '').strip():
                f['body'] = (bd.get('body') or '')
                if not f.get('fromName'):
                    f['fromName'] = (bd.get('from') or 'Google').strip()
                if not f.get('date'):
                    f['date'] = bd.get('date')
            if (f.get('body') or '').strip():
                msgs.append(f)
        if msgs:
            msgs = sorted(msgs, key=lambda f: parse_dt(f.get('date')))
            e['messages'] = msgs
            e['fullDate'] = msgs[-1].get('date') if msgs else e['date']
    if len(e['messages']) == 0 and e['folder'] == 'inbox' and (e['subject'] or '').strip().startswith('Following up'):
        for k, sv in sent_lg_all.items():
            pages = sv.get('pages') or []
            first = lg_parse(pages[0]) if pages else {}
            if (first.get('subject') or '').startswith('Following'):
                msgs = [lg_parse(pg) for pg in pages]
                msgs = sorted(msgs, key=lambda f: parse_dt(f.get('date')))
                e['messages'] = msgs
                e['fromEmail'] = 'mkhizemksihle@gmail.com'
                e['fullDate'] = msgs[-1].get('date') if msgs else e['date']
                break
    if len(e['messages']) == 0:
        e['messages'] = [{'fromName': e['fromName'], 'fromEmail': e.get('fromEmail'), 'date': e.get('date'),
                          'body': (e['subject'] or '') + '. ' + (e['snippet'] or ''), 'attachments': []}]

def ts_email(e):
    parts = []
    parts.append("id: " + L(e['id']))
    parts.append("folder: '" + e['folder'] + "'")
    parts.append("category: '" + e['category'] + "'")
    parts.append("fromName: " + L(e['fromName']))
    parts.append("fromEmail: " + L(e['fromEmail']))
    parts.append("toName: " + L(e.get('toName')))
    parts.append("toEmail: null")
    parts.append("subject: " + L(e['subject']))
    parts.append("snippet: " + L(e['snippet']))
    parts.append("attachments: " + L(e['attachments']))
    msgObjs = []
    for m in e['messages']:
        mp = []
        mp.append('fromName: ' + L(m.get('fromName') or 'Unknown'))
        if m.get('fromEmail') is not None:
            mp.append('fromEmail: ' + L(m.get('fromEmail')))
        if m.get('date') is not None:
            mp.append('date: ' + L(m.get('date')))
        mp.append('body: ' + L(m.get('body') or ''))
        atts = [a for a in (m.get('attachments') or []) if isinstance(a, dict) and a.get('name')]
        mp.append('attachments: ' + L(atts))
        msgObjs.append('{ ' + ', '.join(mp) + ' }')
    parts.append('messages: [' + ', '.join(msgObjs) + ']')
    parts.append("date: " + L(e['date']))
    parts.append("fullDate: " + L(e['fullDate']))
    parts.append("unread: " + ('true' if e['unread'] else 'false'))
    parts.append("starred: " + ('true' if e['starred'] else 'false'))
    parts.append("avatarColor: '" + (e['avatarColor'] or '#a4c2f4') + "'")
    parts = [p for p in parts if not p.endswith(': null')]
    return '  {\n    ' + ',\n    '.join(parts) + ',\n  },'


banner = '''/**
 * REAL mailbox snapshot for Sihle Mkhize <mkhizemksihle@gmail.com> — captured
 * locally from the account owner's own browser session. No backend, nothing
 * leaves the device. Personal data — keep the repo private.
 */
import type { Email } from '../types/email';

export const ACCOUNT = {
  name: 'Sihle Mkhize',
  email: 'mkhizemksihle@gmail.com',
};

export const ACCOUNT_COLOR = '#DB4437';

export const INITIAL_EMAILS: Email[] = [
'''
tail = '];\n'
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(banner)
    for e in emails:
        f.write(ts_email(e) + '\n')
    f.write(tail)
print('WROTE', OUT)
