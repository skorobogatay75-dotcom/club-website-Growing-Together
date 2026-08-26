import { isPublicText } from "@/lib/content/public-text";
import { InlineText } from "@/components/public/InlineText";

type ContentBlock = {
  type?: string;
  text?: string;
  level?: number;
  items?: string[];
};

function asBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object") as ContentBlock[];
}

export function ContentBlocks({ value }: { value: unknown }) {
  const blocks = asBlocks(value);
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4 text-base leading-relaxed text-foreground">
      {blocks.map((block, index) => {
        if (block.type === "heading" && isPublicText(block.text)) {
          const Tag = block.level === 3 ? "h3" : "h2";
          return (
            <Tag
              key={index}
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              <InlineText text={block.text} />
            </Tag>
          );
        }

        if (block.type === "list" && Array.isArray(block.items)) {
          const items = block.items.filter((item) => isPublicText(item));
          if (items.length === 0) return null;
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-muted">
              {items.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (isPublicText(block.text)) {
          return (
            <p key={index} className="text-muted">
              <InlineText text={block.text} />
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
