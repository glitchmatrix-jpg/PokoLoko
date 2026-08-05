# Build and Package

## Production build

```powershell
npm ci
npm run build
npm start
```

The packaged renderer URL is resolved from `app.getAppPath()/dist/index.html` as a `file:` URL. Vite uses `base: './'`, so scripts and styles remain relative after packaging.

## Unpacked smoke package

```powershell
npm run package:dir
```

Launch the generated executable under `release/win-unpacked/` and verify pet, settings, diagnostics, and tray.

## Windows installer

```powershell
npm run package:win
```

The NSIS installer is written under `release/`. The authoritative icon is `build/pokoloko.ico`.

## Clean-machine checklist

- install succeeds without a developer toolchain;
- app starts from Start menu;
- no console window appears;
- tray icon appears once;
- transparent pet window opens;
- settings and diagnostics load packaged renderer assets;
- app quits completely;
- uninstall removes application files.

## Platform limitation

A Linux CI package smoke can verify file inclusion and build output, but Windows transparent-window, tray, and NSIS launch behavior must be proven on a Windows runner or machine.
