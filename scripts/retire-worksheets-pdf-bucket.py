"""Empty + delete legacy worksheets-pdf bucket; ensure worksheets exists."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_storage import client, ensure_bucket, list_buckets, request  # noqa: E402


def list_all_objects(base: str, key, ctx, bucket: str, prefix: str = "") -> list[str]:
    paths: list[str] = []
    offset = 0
    while True:
        payload = json.dumps(
            {"prefix": prefix, "limit": 100, "offset": offset}
        ).encode()
        code, body = request(
            "POST",
            f"{base}/storage/v1/object/list/{bucket}",
            key,
            ctx,
            data=payload,
            headers={"Content-Type": "application/json"},
            timeout=60,
        )
        if code >= 400:
            break
        rows = json.loads(body.decode() or "[]")
        if not rows:
            break
        for row in rows:
            name = row.get("name") or ""
            full = f"{prefix}{name}" if not prefix else f"{prefix.rstrip('/')}/{name}"
            # folder markers have id null sometimes — recurse if metadata says folder
            meta = row.get("metadata")
            if meta is None and not name.endswith(".pdf") and "." not in name:
                paths.extend(list_all_objects(base, key, ctx, bucket, full + "/"))
            else:
                paths.append(full)
        if len(rows) < 100:
            break
        offset += 100
    return paths


def main() -> None:
    base, key, ctx = client()
    have = set(list_buckets(base, key, ctx))
    print("buckets:", sorted(have))
    ensure_bucket(base, key, ctx, "worksheets", public=True)

    if "worksheets-pdf" not in have:
        print("worksheets-pdf already gone")
        return

    objects = list_all_objects(base, key, ctx, "worksheets-pdf")
    print(f"objects in worksheets-pdf: {len(objects)}")
    for path in objects:
        code, body = request(
            "DELETE",
            f"{base}/storage/v1/object/worksheets-pdf/{path}",
            key,
            ctx,
            timeout=60,
        )
        print(f"  delete {path} -> {code}")

    # bulk delete endpoint
    if objects:
        payload = json.dumps({"prefixes": objects}).encode()
        code, body = request(
            "DELETE",
            f"{base}/storage/v1/object/worksheets-pdf",
            key,
            ctx,
            data=payload,
            headers={"Content-Type": "application/json"},
            timeout=120,
        )
        print("bulk delete", code, body[:200])

    code, body = request(
        "DELETE",
        f"{base}/storage/v1/bucket/worksheets-pdf",
        key,
        ctx,
        timeout=60,
    )
    print("delete bucket", code, body[:200])
    print("buckets now:", sorted(list_buckets(base, key, ctx)))


if __name__ == "__main__":
    main()
