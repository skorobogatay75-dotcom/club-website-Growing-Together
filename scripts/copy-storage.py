#!/usr/bin/env python3
"""Copy Storage objects from hosted Supabase to local self-hosted Storage."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request

SOURCE = os.environ.get("SOURCE_URL", "https://hwxdwfqrvvhojzucxriz.supabase.co").rstrip("/")
SOURCE_KEY = os.environ.get("SOURCE_KEY", "").strip()
TARGET = os.environ.get("TARGET_URL", "http://127.0.0.1").rstrip("/")
TARGET_REST = os.environ.get("TARGET_REST", TARGET).rstrip("/")
TARGET_STORAGE = os.environ.get("TARGET_STORAGE", TARGET).rstrip("/")
TARGET_KEY = os.environ.get("TARGET_KEY", "").strip()

PATH_QUERIES = [
    ("public-media", "photos", "storage_path"),
    ("public-documents", "documents", "storage_path"),
    ("public-media", "programs", "cover_path"),
    ("public-media", "events", "cover_path"),
    ("public-media", "news_posts", "cover_path"),
    ("public-media", "team_members", "photo_path"),
]


def rest_headers(key: str) -> dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "User-Agent": "club-copy/1.0",
    }


def rest_table_url(table: str, column: str) -> str:
    # Kong/Caddy expose /rest/v1; PostgREST itself serves tables at /
    parsed = urllib.parse.urlparse(TARGET_REST)
    host = (parsed.hostname or "").lower()
    direct = host in {"rest", "supabase-rest"} or parsed.port == 3000
    prefix = "" if direct else "/rest/v1"
    return f"{TARGET_REST}{prefix}/{table}?select={column}"


def fetch_paths(table: str, column: str) -> list[str]:
    url = rest_table_url(table, column)
    req = urllib.request.Request(url, headers=rest_headers(TARGET_KEY))
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            rows = json.loads(resp.read().decode("utf-8") or "[]")
    except urllib.error.HTTPError as exc:
        body = exc.read()[:200]
        raise SystemExit(f"list {table}: HTTP {exc.code} {url} {body!r}") from exc
    paths = []
    for row in rows:
        value = row.get(column)
        if value and not str(value).startswith("http"):
            paths.append(str(value).lstrip("/"))
    return paths


def download(bucket: str, path: str) -> bytes:
    encoded = urllib.parse.quote(path, safe="/")
    url = f"{SOURCE}/storage/v1/object/public/{bucket}/{encoded}"
    req = urllib.request.Request(url, headers={"User-Agent": "club-copy/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def mime_for(path: str) -> str:
    lower = path.lower()
    if lower.endswith(".jpg") or lower.endswith(".jpeg"):
        return "image/jpeg"
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith(".webp"):
        return "image/webp"
    if lower.endswith(".pdf"):
        return "application/pdf"
    if lower.endswith(".docx"):
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return "application/octet-stream"


def upload(bucket: str, path: str, data: bytes) -> None:
    encoded = urllib.parse.quote(path, safe="/")
    url = f"{TARGET_STORAGE}/object/{bucket}/{encoded}"
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            **rest_headers(TARGET_KEY),
            "Content-Type": mime_for(path),
            "x-upsert": "true",
        },
    )
    try:
        urllib.request.urlopen(req, timeout=120).read()
    except urllib.error.HTTPError as exc:
        if exc.code in (409,):
            return
        raise SystemExit(f"{bucket}/{path}: HTTP {exc.code} {exc.read()[:200]!r}") from exc


def main() -> None:
    if not SOURCE_KEY or not TARGET_KEY:
        raise SystemExit("Set SOURCE_KEY and TARGET_KEY")
    seen: set[tuple[str, str]] = set()
    copied = 0
    for bucket, table, column in PATH_QUERIES:
        for path in fetch_paths(table, column):
            key = (bucket, path)
            if key in seen:
                continue
            seen.add(key)
            try:
                data = download(bucket, path)
            except urllib.error.HTTPError as exc:
                print(f"skip {bucket}/{path}: HTTP {exc.code}")
                continue
            upload(bucket, path, data)
            copied += 1
            print(f"ok {bucket}/{path}")
    print(f"done files={copied}")


if __name__ == "__main__":
    main()
