# PokoLoko Step 5 — Desktop QA Laboratory

## Purpose
The diagnostics surface is now a packaged-app QA laboratory. It reports the authoritative interaction lifecycle, animation and generation, pointer and native-window coordinates, maximum drag distance, drag phase, active activity, last completion event, animation watchdog state, and the planner's most recent decision reason.

## Force controls
- Slow and rapid native drag paths
- Pickup/carried/landing choreography
- Activity interruption
- Deliberately omitted renderer completion (watchdog recovery)
- Character switching
- Sleep and waking
- Left/right screen-edge movement
- Previous/next-monitor relocation
- Every runtime animation for the selected character

## Packaged Windows acceptance checklist
Run the installer/portable executable produced by GitHub Actions. Do not certify development mode.

1. Drag slowly for at least five seconds.
2. Drag rapidly in both directions.
3. Release inside the original window footprint.
4. Release after leaving the original window footprint.
5. Drag while walking.
6. Drag while sleeping.
7. Drag during every available activity.
8. Force each animation and verify completion or intentional looping.
9. Inject a missed completion and verify the watchdog restores a valid state.
10. Move to both screen edges.
11. Relocate across every attached monitor.
12. Switch Poko/Loko during idle and after recovery.
13. Run unattended for at least 30 minutes.
14. Export the diagnostic trace.
15. Fail the build for lost drag, frozen animation, stale state, anchor snapping, involuntary repetition, or failure to restore idle.

## Certification rule
A release passes only when all tests complete in the packaged Windows build with no lost dragging, frozen one-shot animation, stale activity restoration, stuck interaction state, or obvious repetitive loop. The diagnostic trace and manual checklist must be kept with the release candidate evidence.
