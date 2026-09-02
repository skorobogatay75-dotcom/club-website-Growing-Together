#!/usr/bin/env python3
"""Copy public club tables from hosted Supabase to local self-hosted API."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request

SOURCE = os.environ.get("SOURCE_URL", "https://hwxdwfqrvvhojzucxriz.supabase.co").rstrip("/")
SOURCE_KEY = os.environ.get("SOURCE_KEY", "").strip()
TARGET = os.environ.get("TARGET_URL", "http://127.0.0.1").rstrip("/")
TARGET_KEY = os.environ.get("TARGET_KEY", "").strip()

TABLES = [
    "age_categories",
    "document_categories",
    "programs",
    "events",
    "news_posts",
    "albums",
    "photos",
    "documents",
    "program_documents",
    "membership_plans",
    "team_members",
    "site_settings",
]

NULL_FK = ("created_by", "updated_by")


def headers(key: str, extra: dict[str, str] | None = None) -> dict[str, str]:
    h = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }
    if extra:
        h.update(extra)
    return h


def request(url: str, key: str, method: str = "GET", body: bytes | None = None, extra: dict[str, str] | None = None) -> object:
    req = urllib.request.Request(url, data=body, method=method, headers=headers(key, extra))
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read()
        if not raw:
            return None
        return json.loads(raw.decode("utf-8"))


def fetch_all(base: str, key: str, table: str) -> list[dict]:
    rows: list[dict] = []
    start = 0
    while True:
        url = f"{base}/rest/v1/{table}?select=*&order=id"
        extra = {"Range": f"{start}-{start + 999}"}
        req = urllib.request.Request(url, method="GET", headers=headers(key, extra))
        with urllib.request.urlopen(req, timeout=120) as resp:
            chunk = json.loads(resp.read().decode("utf-8") or "[]")
        if not chunk:
            break
        rows.extend(chunk)
        if len(chunk) < 1000:
            break
        start += 1000
    return rows


def clean(row: dict) -> dict:
    out = dict(row)
    for key in NULL_FK:
        if key in out:
            out[key] = None
    return out


def upsert(table: str, rows: list[dict], on_conflict: str) -> None:
    if not rows:
        print(f"{table}: 0")
        return
    payload = json.dumps(rows).encode("utf-8")
    extra = {
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    url = f"{TARGET}/rest/v1/{table}?on_conflict={urllib.parse.quote(on_conflict)}"
    request(url, TARGET_KEY, method="POST", body=payload, extra=extra)
    print(f"{table}: {len(rows)}")


def main() -> None:
    if not SOURCE_KEY or not TARGET_KEY:
        raise SystemExit("Set SOURCE_KEY and TARGET_KEY")
    for table in TABLES:
        rows = [clean(r) for r in fetch_all(SOURCE, SOURCE_KEY, table)]
        if table == "albums":
            for row in rows:
                row["cover_photo_id"] = None
        conflict = "program_id,document_id" if table == "program_documents" else "id"
        if table == "site_settings":
            conflict = "key"
        upsert(table, rows, conflict)
    albums = fetch_all(SOURCE, SOURCE_KEY, "albums")
    for row in albums:
        if not row.get("cover_photo_id"):
            continue
        body = json.dumps({"cover_photo_id": row["cover_photo_id"]}).encode("utf-8")
        url = f"{TARGET}/rest/v1/albums?id=eq.{row['id']}"
        request(
            url,
            TARGET_KEY,
            method="PATCH",
            body=body,
            extra={"Content-Type": "application/json", "Prefer": "return=minimal"},
        )
    print("done")


if __name__ == "__main__":
    main()
