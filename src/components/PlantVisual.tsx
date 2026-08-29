import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

/** Deterministic botanical tile derived from the record's hue. */
export function PlantVisual({
  hue,
  name,
  className,
  compact = false,
}: {
  hue: number;
  name: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{
        background: `radial-gradient(120% 100% at 20% 0%, oklch(0.72 0.16 ${hue} / 0.85), transparent 62%), radial-gradient(90% 90% at 90% 100%, oklch(0.5 0.13 ${(hue + 55) % 360} / 0.75), transparent 60%), oklch(0.3 0.06 ${hue} / 0.55)`,
      }}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:repeating-linear-gradient(115deg,transparent_0_10px,oklch(1_0_0/0.35)_10px_11px)]" />
      <Leaf
        className={cn(
          "absolute -bottom-4 -right-3 rotate-[18deg] opacity-25",
          compact ? "size-16" : "size-28",
        )}
        strokeWidth={1}
      />
      <span className="sr-only">{name}</span>
    </div>
  );
}
