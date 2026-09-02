#!/usr/bin/env python3
"""Copy Storage objects from hosted Supabase to local self-hosted Storage."""

from __future__ import annotations

import json
import os
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SOURCE = os.environ.get("SOURCE_URL", "https://hwxdwfqrvvhojzucxriz.supabase.co").rstrip("/")
SOURCE_KEY = os.environ.get("SOURCE_KEY", "").strip().strip('"').strip("'")
TARGET = os.environ.get("TARGET_URL", "http://127.0.0.1").rstrip("/")
TARGET_REST = os.environ.get("TARGET_REST", TARGET).rstrip("/")
TARGET_KEY = os.environ.get("TARGET_KEY", "").strip().strip('"').strip("'")

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


def rest_table_url(table: str, column: str, schema: str = "public") -> str:
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


def docker_output(args: list[str]) -> str:
    return subprocess.check_output(args, text=True).strip()


def storage_host_root() -> Path:
    mounts = docker_output(
        [
            "docker",
            "inspect",
            "supabase-storage",
            "--format",
            '{{range .Mounts}}{{.Source}}|{{.Destination}}\n{{end}}',
        ]
    )
    host = ""
    for line in mounts.splitlines():
        if "|" not in line:
            continue
        source, dest = line.split("|", 1)
        if dest.rstrip("/") in {"/var/lib/storage", "/var/lib/storage/data"}:
            host = source
            break
        if dest.rstrip("/").endswith("storage") and not host:
            host = source
    if not host:
        raise SystemExit(f"storage volume not found:\n{mounts}")
    inner = ""
    try:
        inner = docker_output(["docker", "exec", "supabase-storage", "ls", "-1", "/var/lib/storage"])
    except subprocess.CalledProcessError:
        inner = ""
    names = set(inner.split())
    if "data" in names:
        candidate = Path(host) / "data"
        if candidate.is_dir() or not names - {"data"}:
            return candidate
    return Path(host)


def write_file(root: Path, bucket: str, path: str, data: bytes, mime: str) -> Path:
    dest = root / bucket / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    try:
        os.setxattr(dest, "user.supabase.content-type", mime.encode())
        os.setxattr(dest, "user.supabase.cache-control", b"3600")
    except OSError:
        pass
    return dest


def objects_url() -> str:
    parsed = urllib.parse.urlparse(TARGET_REST)
    host = (parsed.hostname or "").lower()
    direct = host in {"rest", "supabase-rest"} or parsed.port == 3000
    prefix = "" if direct else "/rest/v1"
    return (
        f"{TARGET_REST}{prefix}/objects?on_conflict=bucket_id,name"
    )


def register_object(bucket: str, path: str, size: int, mime: str) -> None:
    payload = json.dumps(
        {
            "bucket_id": bucket,
            "name": path,
            "metadata": {
                "mimetype": mime,
                "size": size,
                "cacheControl": "3600",
            },
        }
    ).encode()
    headers = {
        **rest_headers(TARGET_KEY),
        "Content-Type": "application/json",
        "Content-Profile": "storage",
        "Prefer": "return=minimal,resolution=merge-duplicates",
    }
    req = urllib.request.Request(objects_url(), data=payload, method="POST", headers=headers)
    try:
        urllib.request.urlopen(req, timeout=60).read()
        return
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")[:300]
        if exc.code in (200, 201, 409):
            return
        print(f"rest objects {exc.code}, trying sql: {body}")
    insert_via_sql(bucket, path, size, mime)


def sql_literal(value: str) -> str:
    return "$$" + value.replace("$", "") + "$$"


def insert_via_sql(bucket: str, path: str, size: int, mime: str) -> None:
    sql = f"""
INSERT INTO storage.objects (bucket_id, name, metadata)
VALUES (
  {sql_literal(bucket)},
  {sql_literal(path)},
  jsonb_build_object('mimetype', {sql_literal(mime)}, 'size', {size}, 'cacheControl', '3600')
)
ON CONFLICT (bucket_id, name) DO UPDATE SET
  metadata = EXCLUDED.metadata,
  updated_at = now();
"""
    result = subprocess.run(
        ["docker", "exec", "-i", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1"],
        input=sql,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        err = (result.stderr or result.stdout)[:400]
        raise SystemExit(f"sql {bucket}/{path}: {err}")


def main() -> None:
    if not SOURCE_KEY or not TARGET_KEY:
        raise SystemExit("Set SOURCE_KEY and TARGET_KEY")
    root = storage_host_root()
    print(f"storage dir {root}")
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
            mime = mime_for(path)
            dest = write_file(root, bucket, path, data, mime)
            print(f"write {dest} ({len(data)} bytes)")
            register_object(bucket, path, len(data), mime)
            copied += 1
            print(f"ok {bucket}/{path}")
    print(f"done files={copied}")


if __name__ == "__main__":
    main()
