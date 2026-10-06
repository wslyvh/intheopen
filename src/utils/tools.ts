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
    id: "image-to-text",
    title: "Image to text",
    description:
      "Extract text from screenshots and images locally. Edit and copy it without sending files to a cloud service.",
    href: "/tools/image-to-text",
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
  {
    id: "url-cleaner",
    title: "URL cleaner",
    description:
      "Remove common tracking parameters from links before you share them.",
    status: "coming soon",
  },
] as const;
