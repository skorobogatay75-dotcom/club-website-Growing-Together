import { getSupabaseBackendUrl } from "@/lib/supabase/env";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const HOP_BY_HOP = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function backendTarget(request: NextRequest, path: string[]): URL | null {
  const base = getSupabaseBackendUrl();
  if (!base) return null;
  const url = new URL(path.join("/"), `${base}/`);
  url.search = request.nextUrl.search;
  return url;
}

function filterHeaders(headers: Headers): Headers {
  const out = new Headers();
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
}

async function proxy(request: NextRequest, path: string[]) {
  const target = backendTarget(request, path);
  if (!target) {
    return NextResponse.json(
      { error: "Supabase backend is not configured" },
      { status: 502 },
    );
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const headers = filterHeaders(request.headers);

  let response: Response;
  try {
    response = await fetch(target, {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { error: "Supabase backend is unreachable" },
      { status: 502 },
    );
  }

  const outHeaders = filterHeaders(response.headers);
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
export async function HEAD(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
export async function OPTIONS(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path ?? []);
}
