import { Fragment } from "react";
import { parseInlineMarkup } from "@/lib/content/inline-markup";

/** Рендер текста с безопасными ссылками `[текст](https://...)`. */
export function InlineText({ text }: { text: string }) {
  const parts = parseInlineMarkup(text);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              {part.text}
            </a>
          );
        }
        return <Fragment key={index}>{part.value}</Fragment>;
      })}
    </>
  );
}
