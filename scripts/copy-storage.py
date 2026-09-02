#!/usr/bin/env python3
"""Copy Storage objects from hosted Supabase to local self-hosted Storage."""

from __future__ import annotations

import http.client
import json
import os
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SOURCE = os.environ.get("SOURCE_URL", "https://hwxdwfqrvvhojzucxriz.supabase.co").rstrip("/")
SOURCE_KEY = os.environ.get("SOURCE_KEY", "").strip().strip('"').strip("'")
TARGET = os.environ.get("TARGET_URL", "http://127.0.0.1").rstrip("/")
TARGET_REST = os.environ.get("TARGET_REST", TARGET).rstrip("/")
TARGET_STORAGE = os.environ.get("TARGET_STORAGE", TARGET).rstrip("/")
TARGET_KEY = os.environ.get("TARGET_KEY", "").strip().strip('"').strip("'")

PATH_QUERIES = [
    ("public-media", "photos", "storage_path"),
    ("public-documents", "documents", "storage_path"),
    ("public-media", "programs", "cover_path"),
    ("public-media", "events", "cover_path"),
    ("public-media", "news_posts", "cover_path"),
    ("public-media", "team_members", "photo_path"),
]

UPLOAD_SNIPPET = r"""
import http.client, os, sys
data = open("/file", "rb").read()
path = os.environ["UPLOAD_PATH"]
mime = os.environ["UPLOAD_MIME"]
key = os.environ["TARGET_KEY"]
conn = http.client.HTTPConnection("storage", 5000, timeout=180)
conn._http_vsn = 10
conn._http_vsn_str = "HTTP/1.0"
headers = {
    "Authorization": "Bearer " + key,
    "apikey": key,
    "Content-Type": mime,
    "Content-Length": str(len(data)),
    "x-upsert": "true",
    "Connection": "close",
}
conn.request("POST", path, body=data, headers=headers)
resp = conn.getresponse()
body = resp.read()
if resp.status not in (200, 201, 409):
    sys.stderr.write(body[:400].decode("utf-8", "replace"))
    sys.exit(resp.status)
"""


def rest_headers(key: str) -> dict[str, str]:
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "User-Agent": "club-copy/1.0",
    }


def rest_table_url(table: str, column: str) -> str:
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
    last_error: Exception | None = None
    for attempt in range(1, 5):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                return resp.read()
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, TimeoutError, BrokenPipeError, ConnectionResetError) as exc:
            last_error = exc
            print(f"retry download {attempt}/4 {bucket}/{path}: {exc}")
            time.sleep(attempt * 2)
    raise SystemExit(f"download {bucket}/{path}: {last_error}")


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


def in_docker() -> bool:
    return Path("/.dockerenv").exists()


def docker_network() -> str:
    return subprocess.check_output(
        [
            "docker",
            "inspect",
            "supabase-storage",
            "-f",
            "{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}",
        ],
        text=True,
    ).strip()


def storage_post_path(bucket: str, path: str) -> str:
    encoded = urllib.parse.quote(path, safe="/")
    parsed = urllib.parse.urlparse(TARGET_STORAGE)
    host = (parsed.hostname or "").lower()
    direct = host in {"storage", "supabase-storage"} or parsed.port == 5000
    if direct:
        return f"/object/{bucket}/{encoded}"
    return f"/storage/v1/object/{bucket}/{encoded}"


def upload_http(bucket: str, path: str, data: bytes) -> None:
    parsed = urllib.parse.urlparse(TARGET_STORAGE)
    object_path = storage_post_path(bucket, path)
    last_error: Exception | None = None
    for attempt in range(1, 6):
        conn = http.client.HTTPConnection(parsed.hostname or "127.0.0.1", parsed.port or 80, timeout=180)
        conn._http_vsn = 10
        conn._http_vsn_str = "HTTP/1.0"
        try:
            headers = {
                "Host": parsed.netloc,
                "Authorization": f"Bearer {TARGET_KEY}",
                "apikey": TARGET_KEY,
                "Content-Type": mime_for(path),
                "Content-Length": str(len(data)),
                "x-upsert": "true",
                "Connection": "close",
            }
            conn.request("POST", object_path, body=data, headers=headers)
            resp = conn.getresponse()
            body = resp.read()
            if resp.status in (200, 201, 409):
                return
            raise SystemExit(f"{bucket}/{path}: HTTP {resp.status} {body[:200]!r}")
        except SystemExit:
            raise
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError, OSError) as exc:
            last_error = exc
            print(f"retry upload {attempt}/5 {bucket}/{path}: {exc}")
            time.sleep(attempt * 2)
        finally:
            conn.close()
    raise SystemExit(f"{bucket}/{path}: upload failed {last_error}")


def upload_via_docker(bucket: str, path: str, data: bytes) -> None:
    net = docker_network()
    with tempfile.NamedTemporaryFile(delete=False) as handle:
        handle.write(data)
        host_file = handle.name
    try:
        result = subprocess.run(
            [
                "docker",
                "run",
                "--rm",
                "--network",
                net,
                "-v",
                f"{host_file}:/file:ro",
                "-e",
                f"TARGET_KEY={TARGET_KEY}",
                "-e",
                f"UPLOAD_PATH=/object/{bucket}/{urllib.parse.quote(path, safe='/')}",
                "-e",
                f"UPLOAD_MIME={mime_for(path)}",
                "python:3.12-slim",
                "python",
                "-c",
                UPLOAD_SNIPPET,
            ],
            capture_output=True,
        )
        if result.returncode != 0:
            err = (result.stderr or result.stdout).decode("utf-8", "replace")[:300]
            raise SystemExit(f"{bucket}/{path}: upload HTTP {result.returncode} {err}")
    finally:
        os.unlink(host_file)


def upload(bucket: str, path: str, data: bytes) -> None:
    if in_docker():
        upload_http(bucket, path, data)
        return
    parsed = urllib.parse.urlparse(TARGET_STORAGE)
    host = (parsed.hostname or "").lower()
    if host in {"storage", "supabase-storage"} or parsed.port == 5000:
        upload_http(bucket, path, data)
        return
    # Host → Caddy/Envoy breaks on files around 1 MB. Talk to storage from its Docker network.
    upload_via_docker(bucket, path, data)


def main() -> None:
    if not SOURCE_KEY or not TARGET_KEY:
        raise SystemExit("Set SOURCE_KEY and TARGET_KEY")
    seen: set[tuple[str, str]] = set()
    copied = 0
    for bucket, table, column in PATH_QUERIES:
        paths = fetch_paths(table, column)
        print(f"list {table}: {len(paths)}")
        for path in paths:
            key = (bucket, path)
            if key in seen:
                continue
            seen.add(key)
            print(f"download {bucket}/{path}")
            try:
                data = download(bucket, path)
            except urllib.error.HTTPError as exc:
                print(f"skip {bucket}/{path}: HTTP {exc.code}")
                continue
            print(f"upload {bucket}/{path} ({len(data)} bytes)")
            upload(bucket, path, data)
            copied += 1
            print(f"ok {bucket}/{path}")
    print(f"done files={copied}")


if __name__ == "__main__":
    main()
