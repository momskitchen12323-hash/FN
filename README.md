# Gmail Android Replica — account-matched

A front-end replica of the **Gmail Android app** whose mailbox content is a
**local snapshot of the account owner's real Gmail account**
(`mkhizemksihle@gmail.com`), capturing:

- **Inbox** (Primary): all 12 real threads — senders, subjects, snippets,
  dates, attachment chips, starred/unread states.
- **Starred threads**: the SAUNIFIX "Application Successful" (12-message) and
  "Inquiry" (10-message) conversations are starred — exactly as on the account,
  with their full 22-message bodies captured.
- **Sent**: all 8 real sent threads with their message bodies.
- **Promotions / Social**: the real sponsored rows (2 + 2).
- **Updates**: empty, matching the real account.

The account identity is `Sihle Mkhize <mkhizemksihle@gmail.com>` — same in the
top-bar avatar, drawer, sent-folder rows.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL in Chrome; press `F12` → device toolbar → 412×915

## Data policy

- **Only local data.** The snapshot was taken from the account owner's own
  logged-in Chrome session (via CDP/`browser-use`), converted to TypeScript
  with `tools/build_data2.py` (reads `/tmp/opencode/gmail-copy` scrape
  artifacts). No backend, no token, no credentials, no runtime network calls.
- **The dataset contains third parties' real names/emails.** Do **not** push
  this repo to a **public** location while this dataset is in
  `src/data/emails.ts` — move it to private first, or swap `emails.ts` back to
  the fictional dataset (in the git history as the
  `feat-real-mailbox` predecessor commit).

## Working UI

- Threaded reading view: active message expanded, earlier messages collapsed
  (Gmail style), attachment cards, Reply / Reply all / Forward.
- Star toggling fully interactive per thread and consistent with the list.
- Mail / Meet bottom bar, Compose FAB, drawer, 4 category tabs
  (Primary / Promotions / Social / Updates) with unread badges.
- Mark-as-unread, Archive/Delete (local state only) on the reading view.
