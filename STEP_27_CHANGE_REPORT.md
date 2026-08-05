# PokoLoko — Step 27 Change Report

- Finalized PokoLoko 1.0.0-rc.1 product identity and metadata.
- Reapplied the authoritative `pokoloko(1).ico` to build and public brand locations.
- Archived the full 2,017-file authoritative asset pack and all available original supplied visual files.
- Added Windows NSIS and portable x64 packaging.
- Added complete GitHub release-candidate assembly, validation, license collection, source archive, rollback archive, and SHA-256 workflow.
- Disabled production renderer source maps.
- Corrected the shared surface contract to include splash and onboarding.
- Added release notes, proprietary source/asset license, third-party notices, build guide, and rollback guide.
- Preserved all cumulative implementation, audit, validation, QA, diagnostic, test, and tuning documents from Steps 01–26.

Native installer generation and clean-machine approval are performed by GitHub Actions because this environment is not Windows and cannot execute Electron Builder's Windows installer lifecycle.
