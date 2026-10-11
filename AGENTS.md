# AGENTS.md

## Skills in use

Consulted (in the authoring environment only — not installed or linked here):

- `frontend-design` — deliberate visual direction, restraint, copy discipline.
- `mobile-app-ui-design` — mobile interaction patterns: thumb-zone targets,
  spacing rhythm, tap targets ≥44px, restrained color hierarchy.

These skills are **method guidance only**; nothing from them is installed,
symlinked or referenced from inside this repo. The project brief is the binding
contract: where guidance and brief conflict, the brief wins.

## Working rules for future agents

- All mail content is **fictional mock data** in `src/data/emails.ts`; keep it
  that way. Do not add network access, persistence, backend or real accounts.
- Keep the app phone-shaped (`.app-frame`, max-width 480px). No desktop layout.
- Fonts (Roboto + Material Symbols Rounded) live in `public/fonts/`
  (@font-face in their local CSS). No network dependency for type. Every
  icon-only button has an a11y label; touch targets ≥ 44×44.
- Primary accent stays `#1A73E8`; verify at 360 / 390 / 412 widths with zero
  horizontal page scroll after any layout change.
