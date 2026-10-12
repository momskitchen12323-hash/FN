# AGENTS.md

## Contents policy (IMPORTANT)

`src/data/emails.ts` now contains a **REAL mailbox snapshot** for the account owner's
own Gmail account (`mkhizemksihle@gmail.com`), captured **locally** from the
account owner's own browser session. Consequences:

- **Never push this data to a public GitHub repository.** The messages include
  third parties (real names). Pushing would publish other people's email.
- No backend, no network use by the app: the data is static TypeScript, it only
  lives on this machine.
- To refresh the snapshot, rerun the (local-only) capture pipeline:
  `tools/build_data2.py` reads the scrape artifacts in `/tmp/opencode/gmail-copy`
  and regenerates `src/data/emails.ts`.
- The account identity must stay `Sihle Mkhize <mkhizemksihle@gmail.com>`
  exactly as the real account.

## Working rules for future agents

- Keep the app phone-shaped (`.app-frame`, max-width 480px). No desktop layout.
- Threads render Gmail-style: active message expanded, older messages as
  collapsed arabic-number mini rows; stars are per-thread and fully clickable.
- Fonts (Roboto + Material Symbols Rounded) live in `public/fonts/`
  (@font-face in their local CSS). No network dependency for type. Every
  icon-only button has an a11y label; touch targets ≥ 44×44.
- Primary accent stays `#1A73E8`; verify at 360 / 390 / 412 widths with zero
  horizontal page scroll after any layout change.
