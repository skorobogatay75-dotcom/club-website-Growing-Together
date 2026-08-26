import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  aspectClass?: string;
  sizes?: string;
  imageClassName?: string;
  placeholder?: string;
};

export function CoverImage({
  src,
  alt,
  aspectClass = "aspect-[16/9]",
  sizes = "(max-width: 768px) 100vw, 33vw",
  imageClassName = "object-cover",
  placeholder = "Без обложки",
}: Props) {
  return (
    <div className={`relative overflow-hidden bg-surface-soft ${aspectClass}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={imageClassName}
        />
      ) : (
        <span className="flex h-full min-h-32 items-center justify-center px-4 text-sm text-muted">
          {placeholder}
        </span>
      )}
    </div>
  );
}
