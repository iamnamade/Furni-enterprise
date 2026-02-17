import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  name: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  showName?: boolean;
};

export function BrandLogo({ name, className, imageClassName, priority = false, showName = false }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt={name}
        width={420}
        height={220}
        priority={priority}
        className={cn("h-14 w-auto object-contain", imageClassName)}
      />
      {showName ? <span className="text-base font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{name}</span> : null}
    </span>
  );
}
