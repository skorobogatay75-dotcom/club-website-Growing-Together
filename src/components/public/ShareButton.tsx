"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type Props = {
  title: string;
};

export function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // пользователь отменил share — не считаем ошибкой
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard недоступен
    }
  }

  return (
    <button type="button" className="btn-secondary" onClick={onShare}>
      {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
      {copied ? "Ссылка скопирована" : "Поделиться"}
    </button>
  );
}
