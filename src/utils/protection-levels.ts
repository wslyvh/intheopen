export const protectionLevels = [
  {
    id: "basic",
    title: "Basic",
    summary: "Limits data use",
    description:
      "Policies and settings limit training and storage. Service providers can still read requests during processing.",
  },
  {
    id: "enhanced",
    title: "Enhanced",
    summary: "Protects conversation content",
    description:
      "Technical controls protect messages and history from service operators. External tools can still share information.",
  },
  {
    id: "high_risk",
    title: "High-risk",
    summary: "Addresses a specific threat",
    description:
      "Requires a defined threat model and stronger evidence that the protections hold against that threat.",
  },
] as const;

export type ProtectionLevel = (typeof protectionLevels)[number]["id"];
