#!/usr/bin/env python3
"""
Supabase Storage helpers (stdlib only) for fresh-project setup + uploads.

Buckets used by this app:
  phonics, story-animations, puzzle-stills, flashcards, verbs,
  colour-board, brand-ads, worksheets, payment-slips
"""

from __future__ import annotations

import json
import mimetypes
import os
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    path = ROOT / ".env.local"
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def client() -> tuple[str, str, ssl.SSLContext]:
    env = load_env()
    url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "").rstrip("/")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or ""
    if not url or not key:
        raise SystemExit("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    ctx = ssl.create_default_context()
    return url, key, ctx


def request(
    method: str,
    url: str,
    key: str,
    ctx: ssl.SSLContext,
    data: bytes | None = None,
    headers: dict | None = None,
    timeout: int = 120,
) -> tuple[int, bytes]:
    hdrs = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
    }
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        body = e.read() if e.fp else b""
        return e.code, body


def list_buckets(base: str, key: str, ctx: ssl.SSLContext) -> list[str]:
    code, body = request("GET", f"{base}/storage/v1/bucket", key, ctx)
    if code >= 400:
        raise SystemExit(f"listBuckets HTTP {code}: {body[:300]!r}")
    data = json.loads(body.decode("utf-8") or "[]")
    return [b.get("id") or b.get("name") for b in data]


def ensure_bucket(base: str, key: str, ctx: ssl.SSLContext, name: str, public: bool = True) -> None:
    have = set(list_buckets(base, key, ctx))
    if name in have:
        print(f"KEEP bucket {name}")
        return
    payload = json.dumps({"id": name, "name": name, "public": public}).encode("utf-8")
    code, body = request(
        "POST",
        f"{base}/storage/v1/bucket",
        key,
        ctx,
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    if code >= 400 and b"already exists" not in body.lower() and b"Duplicate" not in body:
        raise SystemExit(f"createBucket {name} HTTP {code}: {body[:400]!r}")
    print(f"CREATE bucket {name} (public={public})")


def public_url(base: str, bucket: str, object_path: str) -> str:
    return f"{base}/storage/v1/object/public/{bucket}/{object_path}"


def upload_file(
    base: str,
    key: str,
    ctx: ssl.SSLContext,
    bucket: str,
    object_path: str,
    file_path: Path,
) -> str:
    body = file_path.read_bytes()
    ctype = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    # upsert via x-upsert
    code, resp = request(
        "POST",
        f"{base}/storage/v1/object/{bucket}/{object_path}",
        key,
        ctx,
        data=body,
        headers={
            "Content-Type": ctype,
            "x-upsert": "true",
            "cache-control": "31536000",
        },
        timeout=300,
    )
    if code >= 400:
        # try PUT upsert
        code, resp = request(
            "PUT",
            f"{base}/storage/v1/object/{bucket}/{object_path}",
            key,
            ctx,
            data=body,
            headers={
                "Content-Type": ctype,
                "x-upsert": "true",
                "cache-control": "31536000",
            },
            timeout=300,
        )
    if code >= 400:
        raise RuntimeError(f"HTTP {code}: {resp[:300]!r}")
    return public_url(base, bucket, object_path)


def upload_many(
    bucket: str,
    jobs: list[tuple[str, Path]],
    manifest_path: Path,
    one: bool = False,
) -> None:
    base, key, ctx = client()
    ensure_bucket(base, key, ctx, bucket, public=True)
    queue = jobs[:1] if one else jobs
    print(f"Uploading {len(queue)}/{len(jobs)} → {bucket} (one-by-one)")

    manifest: dict = {}
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8")).get("files") or {}
        except Exception:
            manifest = {}

    ok = fail = 0
    for i, (object_path, file_path) in enumerate(queue, 1):
        try:
            url = upload_file(base, key, ctx, bucket, object_path, file_path)
            manifest[object_path] = url
            ok += 1
            print(f"OK {ok}/{len(queue)}  {object_path}  ({file_path.stat().st_size // 1024}KB)")
        except Exception as e:
            fail += 1
            print(f"FAIL {object_path}: {e}")
        time.sleep(0.15)

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(
            {
                "bucket": bucket,
                "public": True,
                "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "ok": ok,
                "fail": fail,
                "files": manifest,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Done ok={ok} fail={fail} → {manifest_path}")
    if fail:
        raise SystemExit(1)
