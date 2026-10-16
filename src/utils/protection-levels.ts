export const protectionLevels = [
  {
    id: "basic",
    title: "Basic",
    summary: "Limits data collection",
    description:
      "Reduces how much personal information is collected, stored or shared. Some information remains accessible to the companies behind the service.",
  },
  {
    id: "enhanced",
    title: "Enhanced",
    summary: "Keeps more information private",
    description:
      "Adds technical protections that limit what companies and other parties can access, not just how they promise to use it.",
  },
  {
    id: "maximum",
    title: "Maximum",
    summary: "Protects your data and identity",
    description:
      "Combines strong data protection with measures that make your activity harder to trace back to you.",
  },
] as const;

export type ProtectionLevel = (typeof protectionLevels)[number]["id"];
