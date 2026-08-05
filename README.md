# PokoLoko

PokoLoko is a private Windows desktop-companion application starring **Poko** and **Loko**. It uses transparent Electron windows, deterministic sprite animation, grounded locomotion, legal state transitions, full activity choreography, social reactions, sleep/wake rhythm, optional privacy-safe context signals, polished settings, onboarding, tray controls, diagnostics, and deterministic testing.

## Build the Windows release on GitHub

1. Create an empty GitHub repository named `PokoLoko`.
2. Extract this ZIP and push **the contents of the `PokoLoko` folder** to the repository root.
3. Open **Actions → PokoLoko Release Candidate → Run workflow**.
4. Leave the version as `1.0.0-rc.1`, or enter the desired release version.
5. Download the `PokoLoko-Release-Candidate-*` artifact when the workflow succeeds.

The artifact contains the NSIS installer, portable executable, unpacked QA build, source archive, rollback archive, test reports, release notes, notices, and SHA-256 hashes.

## Local development

```powershell
npm install --no-audit --no-fund
npm run dev
```

## Local Windows release build

```powershell
npm install --no-audit --no-fund
npm run release:assemble
```

Outputs are written to `release/`.

## Important release gate

The repository performs deterministic validation and packaging automatically. A release is not considered fully approved until the generated Windows build completes the manual QA matrix in `docs/qa/MANUAL_QA_MATRIX.md`, including clean installation, mixed-DPI/multi-monitor behavior, tray lifecycle, suspend/resume, and long-session review.

## Privacy

Context awareness is optional and disabled by default. PokoLoko does not read typed text, clipboard contents, screenshots, passwords, messages, browser history, URLs, window titles, or document contents. See `docs/privacy/PRIVACY_CONTROLS.md`.

## Source assets

The complete authoritative asset pack and original supplied source files are preserved under `archive/source-assets/`. Runtime assets are generated and validated under `public/assets/runtime/`.
