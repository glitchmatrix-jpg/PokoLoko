# Packaged Windows QA Checklist

Release version: __________  Commit: __________  Tester: __________  Date: __________

- [ ] Confirm executable was built after the tested commit.
- [ ] Kill all previous PokoLoko processes before launch.
- [ ] Slow drag succeeds.
- [ ] Rapid drag succeeds.
- [ ] Release inside original bounds succeeds.
- [ ] Release outside original bounds succeeds.
- [ ] Drag while walking succeeds.
- [ ] Drag while sleeping succeeds.
- [ ] Drag during each activity succeeds.
- [ ] Every Poko animation completes/restores correctly.
- [ ] Every Loko animation completes/restores correctly.
- [ ] Injected missed completion is recovered by watchdog.
- [ ] Left and right screen-edge movement succeeds.
- [ ] Multi-monitor relocation succeeds on every display.
- [ ] Character switching succeeds before/after recovery.
- [ ] Thirty-minute soak completed.
- [ ] No freeze, snap, stale state, lost drag, or excessive repetition.
- [ ] Diagnostic trace exported and archived.

Notes:

____________________________________________________________________
