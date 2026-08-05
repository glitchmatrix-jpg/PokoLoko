# PokoLoko Development Setup

## Requirements

- Windows 10 or 11 for authoritative native-window QA
- Node.js 22.12 or later
- npm 10 or later
- Git

## Clean setup

```powershell
git clone <repository-url>
cd PokoLoko
npm ci
npm run validate
npm run dev
```

`npm run dev` starts Vite, watches Electron TypeScript, and launches Electron. Step 05 intentionally displays only a transparent blank pet surface plus separate settings and diagnostics windows. No old sprites, random habits, or pet behavior are active.

## Commands

```text
npm run typecheck      strict renderer, Electron, and test type checks
npm run lint           ESLint with typed TypeScript rules
npm test               deterministic Vitest suite
npm run build          renderer + Electron production build
npm run package:dir    unpacked package for local smoke testing
npm run package:win    Windows NSIS installer
npm run validate       formatting, types, lint, tests, build, smoke checks
```

## Environment

Copy `.env.example` only when local overrides are required. Do not commit `.env` files. Environment values are treated as configuration, never secrets shipped to the renderer.

## Windows visual verification

1. Confirm the pet window has a transparent background.
2. Confirm it does not appear in the taskbar.
3. Confirm the tray icon uses the final `pokoloko.ico`.
4. Confirm Settings and Diagnostics open as independent windows.
5. Confirm closing utility windows leaves the tray app alive.
6. Confirm Quit removes tray and all windows.

## Clean repository rule

Generated folders (`node_modules`, `dist`, `dist-electron`, `release`, `coverage`) are ignored. Run `npm run clean` before creating a foundation snapshot.
