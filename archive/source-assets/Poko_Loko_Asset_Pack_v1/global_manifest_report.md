# Step 11 — Global Manifests

Package version: `1.0.0-step11`
Export date: `2026-08-05T11:02:00+05:00`

## Package totals

| Metric | Count |
|---|---:|
| Total Source Candidates | 406 |
| Total Accepted Character Frames | 406 |
| Total Rejected Candidates | 0 |
| Total Isolated Poses | 218 |
| Total Animations | 31 |
| Total Props | 0 |
| Total Effects | 0 |
| Mirrored Animation Count | 2 |

## Created files

- `asset_manifest.json`
- `characters/poko/poko_manifest.json`
- `characters/loko/loko_manifest.json`
- `developer/animation_registry.json`
- `developer/animation_registry.ts`

All developer paths use relative POSIX-style forward slashes.

The TypeScript registry is immediately importable in an Electron/React/TypeScript project and includes typed animation definitions, canvas metadata, frame paths, timing, anchors, movement data, transitions, mirroring provenance, and known issues.