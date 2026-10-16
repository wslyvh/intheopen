import {
  protectionLevels,
  type ProtectionLevel,
} from "@/utils/protection-levels";

export function ProtectionSymbol({ level }: { level: ProtectionLevel }) {
  const active = protectionLevels.findIndex((entry) => entry.id === level) + 1;
  return (
    <svg
      viewBox="0 0 20 16"
      className="text-primary h-4 w-5 shrink-0"
      aria-hidden="true"
    >
      {[4, 8, 12].map((height, index) => (
        <rect
          key={height}
          x={2 + index * 6}
          y={14 - height}
          width="4"
          height={height}
          rx="0.5"
          fill="currentColor"
          opacity={index < active ? 1 : 0.2}
        />
      ))}
    </svg>
  );
}

export function ProtectionBadge({ level }: { level: ProtectionLevel }) {
  const definition = protectionLevels.find((entry) => entry.id === level)!;
  return (
    <span className="badge badge-soft badge-sm shrink-0 gap-2 font-mono">
      <ProtectionSymbol level={level} />
      {definition.title}
    </span>
  );
}
