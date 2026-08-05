# Poko & Loko — Step 1 Image and Alpha Audit

The uploaded originals were copied byte-for-byte into `reference/` and were not edited.

## Poko

- **Dimensions:** 864 × 1152 px
- **Color mode:** RGBA (R, G, B, A)
- **Alpha channel:** Yes
- **Fully transparent:** 693,201 / 995,328 (69.645484%)
- **Semi-transparent:** 117,972 / 995,328 (11.852575%)
- **Fully opaque:** 184,155 / 995,328 (18.501941%)
- **Literal alpha > 0 bounding box (x0, y0, x1, y1):** `(0, 0, 864, 1152)`
- **Operational visible-content bounding box (alpha ≥ 4):** `(10, 9, 843, 1128)`, or `(x=10, y=9, width=833, height=1119)`
- **Border contact:** only four isolated corner pixels with alpha 1–3; no actual sprite touches a border
- **Clipping:** no visible clipping detected
- **Background remnants:** no opaque full-sheet black, white, grey, or checkerboard field detected
- **Opaque pure black pixels:** 20
- **Opaque pure white pixels:** 177
- **Opaque neutral greys, including black/white:** 228
- **Preserved SHA-256:** `ef941efc8f1dc5ba4a36b92baec0205de4072a20c9eae65763dab48b34263271`

### Edge residue

- `(x=0, y=0)` → RGBA `(255, 170, 170, 3)`
- `(x=863, y=0)` → RGBA `(255, 255, 255, 2)`
- `(x=0, y=1151)` → RGBA `(255, 128, 128, 2)`
- `(x=863, y=1151)` → RGBA `(255, 255, 255, 1)`

These edge pixels are nearly transparent residue and must not be mistaken for visible content. They will be excluded from sprite detection while the original sheets remain untouched.

## Loko

- **Dimensions:** 864 × 1152 px
- **Color mode:** RGBA (R, G, B, A)
- **Alpha channel:** Yes
- **Fully transparent:** 657,802 / 995,328 (66.088968%)
- **Semi-transparent:** 125,429 / 995,328 (12.601775%)
- **Fully opaque:** 212,097 / 995,328 (21.309257%)
- **Literal alpha > 0 bounding box (x0, y0, x1, y1):** `(0, 0, 864, 1152)`
- **Operational visible-content bounding box (alpha ≥ 4):** `(6, 12, 854, 1126)`, or `(x=6, y=12, width=848, height=1114)`
- **Border contact:** only four isolated corner pixels with alpha 1–3; no actual sprite touches a border
- **Clipping:** no visible clipping detected
- **Background remnants:** no opaque full-sheet black, white, grey, or checkerboard field detected
- **Opaque pure black pixels:** 2
- **Opaque pure white pixels:** 72
- **Opaque neutral greys, including black/white:** 82
- **Preserved SHA-256:** `6d2689b46f231a57b190b1972098c9291e5137d348bff34bced38085363f5897`

### Edge residue

- `(x=0, y=0)` → RGBA `(255, 255, 128, 2)`
- `(x=863, y=0)` → RGBA `(255, 255, 255, 2)`
- `(x=0, y=1151)` → RGBA `(255, 128, 128, 2)`
- `(x=863, y=1151)` → RGBA `(255, 255, 255, 1)`

These edge pixels are nearly transparent residue and must not be mistaken for visible content. They will be excluded from sprite detection while the original sheets remain untouched.

## Audit decision

- Both files are valid RGBA sprite sheets with genuine alpha transparency.
- The apparent black background is not an opaque background layer.
- Pale cream and white pixels inside the characters will be preserved.
- Extraction should use alpha-connected content analysis and ignore only isolated alpha 1–3 corner residue.
- No evidence of source-level sprite clipping was found during this audit.