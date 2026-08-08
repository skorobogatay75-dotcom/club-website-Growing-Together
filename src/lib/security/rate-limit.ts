type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const DEFAULT_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 8,
} as const;

/**
 * Простой in-memory rate limit для одного инстанса.
 * Для нескольких инстансов позже нужен Redis/Upstash.
 */
export function consumeRateLimit(
  key: string,
  limits: { windowMs: number; max: number } = DEFAULT_RATE_LIMIT,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + limits.windowMs });
    return { ok: true };
  }

  if (current.count >= limits.max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return { ok: true };
}

export function resetRateLimitStoreForTests() {
  buckets.clear();
}
