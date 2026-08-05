# PokoLoko — Step 26 Change Report

## Completed in this repository

- Added bounded CPU, memory, handle, request, and window-movement jitter sampling.
- Exposed the performance summary through the diagnostic snapshot.
- Added explicit sampler lifecycle cleanup.
- Added deterministic unit coverage for performance summary and bounded retention.
- Added six replayable QA trace templates.
- Added a manually dispatched Windows QA artifact workflow.
- Added the manual configuration matrix, long-session protocol, performance thresholds, and release-blocker register.
- Corrected a malformed logger callback in the live pet controller.
- Removed triple execution of the Step 25 validator from the main validation chain.
- Preserved the native Windows QA gate instead of disguising unexecuted tests as passed.

## Evidence classification

Static checks and deterministic evidence are complete. The supplied traces are reproduction templates, not recordings of native Windows execution. Native videos, screenshots, measured performance, and multi-hour observation remain required.

## Release state

The repository is clean and reproducible and can generate the Windows manual-QA artifact. Step 26 acceptance remains blocked by `QA-26-001` until native testing is performed.
