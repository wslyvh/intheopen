export const privacyTools = [
  {
    id: "text-redaction",
    title: "Text redaction",
    description:
      "Find and mask names, addresses, contact details, and financial identifiers before you share text or use AI.",
    href: "/tools/text-redaction",
    status: "available",
  },
  {
    id: "image-redaction",
    title: "Image redaction",
    description:
      "Hide faces and personal details in photos and screenshots before you share them.",
    status: "coming soon",
  },
  {
    id: "metadata-removal",
    title: "Metadata removal",
    description:
      "Remove hidden location, device, and author information from files before you share them.",
    status: "coming soon",
  },
] as const;
