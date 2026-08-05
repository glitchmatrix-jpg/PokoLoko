#!/usr/bin/env python3
"""Validate the Poko & Loko asset package."""

from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path
from PIL import Image, ImageSequence

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise AssertionError(message)


def main() -> int:
    # JSON validity.
    for path in ROOT.rglob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(f"Invalid JSON: {path.relative_to(ROOT)}: {exc}")

    manifest = json.loads((ROOT / "asset_manifest.json").read_text(encoding="utf-8"))

    # Source files and checksums.
    for source in manifest["sources"]:
        path = ROOT / source["relative_path"]
        if not path.exists():
            fail(f"Missing source image: {source['relative_path']}")
        import hashlib
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != source["sha256"]:
            fail(f"Source checksum mismatch: {source['relative_path']}")

    # Animation frames and previews.
    for animation in manifest["animations"]:
        frame_paths = [ROOT / p for p in animation["frames"]]
        if not frame_paths:
            fail(f"No frames listed for {animation['id']}")
        for path in frame_paths:
            if not path.exists():
                fail(f"Missing referenced frame: {path.relative_to(ROOT)}")
            with Image.open(path) as image:
                if image.format != "PNG":
                    fail(f"Not PNG: {path.relative_to(ROOT)}")
                if image.size != (
                    animation["canvas_width"],
                    animation["canvas_height"],
                ):
                    fail(f"Canvas mismatch: {path.relative_to(ROOT)}")

        gif_path = ROOT / animation["preview_gif"]
        if not gif_path.exists():
            fail(f"Missing preview GIF: {gif_path.relative_to(ROOT)}")
        with Image.open(gif_path) as gif:
            frame_count = sum(1 for _ in ImageSequence.Iterator(gif))
        if frame_count != len(frame_paths):
            fail(
                f"Preview frame-count mismatch for {animation['id']}: "
                f"{frame_count} != {len(frame_paths)}"
            )

    # Required documentation.
    required = [
        "README.md",
        "extraction_report.md",
        "qa_report.md",
        "reference/poko_indexed_map.png",
        "reference/loko_indexed_map.png",
        "reference/poko_contact_sheet.png",
        "reference/loko_contact_sheet.png",
        "developer/animation_registry.ts",
        "developer/animation_registry.json",
        "developer/asset_loader_example.ts",
    ]
    for relative in required:
        if not (ROOT / relative).exists():
            fail(f"Missing required package file: {relative}")

    print("Validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
