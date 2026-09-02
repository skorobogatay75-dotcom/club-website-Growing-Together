#!/usr/bin/env python3
"""Create the first staff admin on self-hosted Auth + public.profiles."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

TARGET = os.environ.get("TARGET_URL", "http://127.0.0.1").rstrip("/")
TARGET_KEY = os.environ.get("TARGET_KEY", "").strip().strip('"').strip("'")


def headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    out = {
        "apikey": TARGET_KEY,
        "Authorization": f"Bearer {TARGET_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "club-copy/1.0",
    }
    if extra:
        out.update(extra)
    return out


def request(
    url: str,
    method: str = "GET",
    body: dict | None = None,
    extra: dict[str, str] | None = None,
) -> tuple[int, object]:
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, method=method, headers=headers(extra))
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
            return resp.status, json.loads(raw.decode() or "{}") if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        try:
            parsed = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            parsed = raw.decode("utf-8", "replace")[:400]
        return exc.code, parsed


def find_user(email: str) -> dict | None:
    query = urllib.parse.urlencode({"page": 1, "per_page": 200})
    code, payload = request(f"{TARGET}/auth/v1/admin/users?{query}")
    if code >= 400:
        raise SystemExit(f"list users: HTTP {code} {payload}")
    users = payload.get("users") if isinstance(payload, dict) else None
    if not isinstance(users, list):
        return None
    email_l = email.lower()
    for user in users:
        if str(user.get("email", "")).lower() == email_l:
            return user
    return None


def create_or_update_user(email: str, password: str) -> str:
    code, payload = request(
        f"{TARGET}/auth/v1/admin/users",
        method="POST",
        body={"email": email, "password": password, "email_confirm": True},
    )
    if code in (200, 201) and isinstance(payload, dict) and payload.get("id"):
        return str(payload["id"])

    existing = find_user(email)
    if not existing or not existing.get("id"):
        raise SystemExit(f"create user: HTTP {code} {payload}")

    user_id = str(existing["id"])
    upd_code, upd_payload = request(
        f"{TARGET}/auth/v1/admin/users/{user_id}",
        method="PUT",
        body={"email": email, "password": password, "email_confirm": True},
    )
    if upd_code >= 400:
        raise SystemExit(f"update user: HTTP {upd_code} {upd_payload}")
    return user_id


def insert_profile_sql(user_id: str) -> None:
    sql = f"""
INSERT INTO public.profiles (id, full_name, role, is_active)
VALUES ('{user_id}'::uuid, 'Администратор', 'admin', true)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true,
  updated_at = timezone('utc', now());
"""
    result = subprocess.run(
        [
            "docker",
            "exec",
            "-i",
            "supabase-db",
            "psql",
            "-U",
            "postgres",
            "-d",
            "postgres",
            "-v",
            "ON_ERROR_STOP=1",
        ],
        input=sql,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit((result.stderr or result.stdout)[:400])


def insert_profile(user_id: str) -> None:
    code, payload = request(
        f"{TARGET}/rest/v1/profiles?on_conflict=id",
        method="POST",
        body={
            "id": user_id,
            "full_name": "Администратор",
            "role": "admin",
            "is_active": True,
        },
        extra={"Prefer": "return=minimal,resolution=merge-duplicates"},
    )
    if code in (200, 201, 409):
        return
    print(f"rest profiles {code}, trying sql")
    insert_profile_sql(user_id)


def main() -> None:
    if not TARGET_KEY:
        raise SystemExit("Set TARGET_KEY")
    email = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("ADMIN_EMAIL", "")).strip().lower()
    if not email or "@" not in email:
        raise SystemExit("Usage: python3 create-admin.py email@example.com")
    print("Type the admin password, then Enter.")
    password = sys.stdin.readline().rstrip("\n\r")
    if len(password) < 6:
        raise SystemExit("Password must be at least 6 characters")
    user_id = create_or_update_user(email, password)
    insert_profile(user_id)
    print(f"admin ready {email}")


if __name__ == "__main__":
    main()
