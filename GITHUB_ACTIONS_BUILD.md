# Build Poko without installing npm locally

You do not need Node.js or npm on your own computer to **run** Poko. Node.js/npm are only needed while building the app. The included GitHub Actions workflow moves that build process to GitHub's Windows runner and produces a normal `.exe` installer for you.

## One-time setup

1. Create an empty GitHub repository.
2. Upload every file and folder from this project to the repository root. Make sure `.github/workflows/build-windows.yml` is included.
3. Open the repository's **Actions** tab.
4. Select **Build Poko for Windows**.
5. Choose **Run workflow** and confirm.

## Download the app

After the workflow finishes:

1. Open the completed workflow run.
2. Scroll to **Artifacts**.
3. Download the artifact named `Poko-Windows-...`.
4. Extract the downloaded ZIP.
5. Run `Poko-Setup-0.1.1.exe`.

The resulting computer does not need npm, Node.js, or Electron installed. Those runtime files are packaged into the application.

## What the workflow does

- uses a fresh GitHub-hosted Windows machine;
- installs Node.js only inside that temporary runner;
- installs project dependencies;
- validates sprite assets;
- type-checks the React and Electron code;
- builds the renderer and Electron processes;
- packages an unsigned Windows installer;
- uploads the installer as a downloadable build artifact.

## Windows warning

The installer is unsigned. Windows SmartScreen may display an "Unknown publisher" warning. That does not automatically mean the file is malicious; it means the executable has not been signed with a paid code-signing certificate. For public distribution, add code signing later.

## Updating Poko

Push new code to the `main` branch and the workflow will build again automatically. You can also run it manually from the Actions tab at any time.
