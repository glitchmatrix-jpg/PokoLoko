# PokoLoko — Display Grounding Tests

## Automated coverage

`tests/unit/display-grounding.test.ts` verifies:

- the 128×128 manifest ground anchor lands exactly on the selected work-area ground;
- floating-point conceptual positions are not required for static placement;
- horizontal placement is clamped so the native window remains reachable;
- negative virtual-desktop coordinates are supported;
- the nearest remaining work area can be selected after topology changes.

`tests/unit/asset-url.test.ts` verifies that the same runtime frame path resolves under both the Vite development origin and packaged `file://` index location.

## Native Windows matrix

The following must be recorded before Step 08 closes:

| Scenario | Expected result | Status |
|---|---|---|
| Windows 11, 100% DPI | crisp 1×/2×/3× render; anchor above taskbar | pending native run |
| Windows 11, 125% DPI | no filtering or scale drift | pending native run |
| Windows 11, 150% DPI | no filtering or clipping | pending native run |
| Mixed 100% + 150% displays | same logical character scale; stable grounding | pending native run |
| Secondary display with negative X | pet remains reachable | pending native run |
| Bottom taskbar | visible body does not overlap taskbar | pending native run |
| Side taskbar | work-area width respected | pending native run |
| Auto-hidden taskbar | transparent margin does not block reveal | pending native run |
| Display removed | pet recovers to nearest remaining display | pending native run |
| Resolution/work-area change | pet is re-grounded without character resize | pending native run |
| Poko ↔ Loko switch | same canvas and scale; no CSS jump | pending native run |

## Event handling

The main process listens for `display-added`, `display-removed`, and `display-metrics-changed`. It stops relying on stale display bounds, recomputes the work-area anchor, and republishes presentation metadata.

## Closure evidence

Native closure should include screenshots at each DPI, a short display-removal recording, and confirmation that desktop clicks pass through transparent regions. These are human/native tests; they cannot be truthfully substituted by Linux container geometry checks.
