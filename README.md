# Gmail Android Replica

A pixel-focused, front-end-only replica of the **Gmail Android app**, built with
**React + Vite + TypeScript + Tailwind CSS + React Router** as a school-project
demonstration that an AI coding agent can reproduce a complex, recognizable
mobile interface.

> **Disclaimer:** this is an independent educational recreation of Gmail's UI for
> a course project. Not affiliated with, endorsed by, or connected to Google or
> Gmail. All names, addresses, companies and messages are fictional.

## Running the project

```bash
npm install     # install dependencies
npm run dev     # start Vite dev server (prints a local URL, default http://localhost:5173)
npm run build   # type-check (tsc) + production build into dist/
npm run preview # serve the production build
```

Open the URL in Chrome and enable **DevTools device emulation** for the intended
experience:

| Viewport        | Notes                                   |
| --------------- | --------------------------------------- |
| **412 × 915**   | Primary target (Pixel 7 class)          |
| 390 × 844       | Supported                               |
| 360 × 800       | Narrowest supported — no page scrolling |

## What works

- **Inbox** — 15 fictional emails (6 unread, 4 starred), white unread rows on a
  light gray surface, sender/subject bold, blue unread dates, gold stars.
- **Category tabs** — Primary (all mail), Social and Promotions filter their
  own subsets, with live unread count badges.
- **Sent** — 8 fictional sent mails; rows show the **recipient** identity;
  each opens its real body and Back returns to Sent.
- **Email detail** — Back / Archive / Delete / Mark-as-unread / Overflow
  toolbar, subject with star, sender row ("to me" / "to {name}"), full body
  (paragraphs preserved), Reply / Reply all / Forward area. Long bodies scroll
  and reply controls scroll in flow, so nothing is hidden behind fixed controls.
- **Navigation drawer** — slide-in drawer with scrim + Escape-key close, account
  header, categories, Inbox/Sent destinations, the starred/snoozed/drafts/spam/
  trash family, Settings and Help & feedback. Inbox shows the **live unread
  count**, derived from the mock data (it updates as mail is read/unread).
- **Compose** — full-screen compose with editable To / Subject / Body, optional
  Cc/Bcc rows, attachment & formatting affordances, and a demo-only Send
  ("nothing was sent" snackbar). Compose FAB opens it; Close returns to the last
  folder.
- **Star toggling** remains consistent across list, detail and in-session state.
- Browser back/forward works with all routes (`/`, `/sent`, `/email/:id`,
  `/compose`).

Everything else (search pill, filter icon, Meet, Starred/Snoozed/Drafts/Spam/
Trash, Settings, Help & feedback, overflow actions, reply actions) is
intentionally static or demo-only, with pressed/active states so nothing feels
broken.

## What it does **not** do

- No backend, no server, no authentication, no real email accounts.
- No network requests for mail data — all content is hardcoded fictional mock
  data in `src/data/emails.ts`, held only in browser memory for the session.
- No sending/receiving of actual email, no persistence beyond the session,
  no analytics, no tracking.
- Desktop is never redesigned: the app stays a phone-sized interface, centered
  on wide screens.

## Structure

```
src/
  main.tsx                 entry, router
  App.tsx                  routes, mailbox state, drawer, snackbar
  index.css                design tokens + all component styling (Tailwind v4)
  data/emails.ts           fictional account + 23 mock messages (15 inbox, 8 sent)
  types/email.ts           shared Email/Folder/Category types
  hooks/useDocumentTitle.ts
  components/
    AppBar.tsx             hamburger, Gmail logo, search pill, avatar
    SearchPill.tsx
    ProfileAvatar.tsx      deterministic letter avatars
    NavigationDrawer.tsx
    InboxHeader.tsx        "Inbox"/"Sent" heading + filter icon
    CategoryTabs.tsx       Primary / Social / Promotions
    ListScreen.tsx         shared list shell (app bar, list, FAB, bottom nav)
    EmailList.tsx / EmailRow.tsx
    ComposeFAB.tsx         multicolor pencil FAB
    EmailDetail.tsx
    ComposeScreen.tsx
    BottomNav.tsx          Mail / Meet
    MaterialIcon.tsx       Material Symbols (ligature) icon component
    GmailLogo.tsx          official Gmail envelope SVG, inlined
```

## Design tokens

Gmail Android light theme, defined as CSS variables in `src/index.css`:
`#1A73E8` primary blue, `#F8FAFD` surface, `#E9EEF6` search pill, `#D3E3FD`
selection chips, `#C2E7FF` compose FAB, `#F4B400` star gold, `#202124/#444746/
#5F6368` text ramp.

**Roboto and Material Symbols Rounded are self-hosted** in
`public/fonts/` (downloaded from Google Fonts at build time and committed as
local files), so the UI renders identically with or without an internet
connection and no icon ever appears as raw ligature text. If the icon font
still fails to load, a guard hides glyph text instead of showing words.

## Skills used during the build

Implementation craft followed guidance from agent skills available in the
authoring environment — `frontend-design` (deliberate visual direction) and
`mobile-app-ui-design` (mobile interaction patterns: thumb-zone targets,
spacing rhythm, tap targets ≥44px, restrained color hierarchy). Skills were used
as working method only; no skill files, symlinks or environment-specific paths
are embedded in this repository. The project spec itself was the binding
contract for scope and layout.
