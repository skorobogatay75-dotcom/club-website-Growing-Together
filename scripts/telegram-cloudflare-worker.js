/**
 * Cloudflare Worker — прокси к Telegram Bot API.
 * Нужен, если хостинг (например Timeweb) не достучится до api.telegram.org.
 *
 * Деплой: Cloudflare Dashboard → Workers → Create → вставить этот код → Deploy.
 * Затем в Timeweb добавьте:
 *   TELEGRAM_API_BASE=https://ИМЯ-ВАШЕГО-WORKER.ВАШ-СУБДОМЕН.workers.dev
 * (без слэша в конце) и сделайте Redeploy приложения.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Health-check без токена
    if (url.pathname === "/" || url.pathname === "") {
      return Response.json({
        ok: true,
        service: "telegram-api-proxy",
        hint: "Use /bot<token>/<method>",
      });
    }

    url.hostname = "api.telegram.org";
    url.protocol = "https:";

    const upstream = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "follow",
    });

    return fetch(upstream);
  },
};
