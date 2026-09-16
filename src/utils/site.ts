export const site = {
  name: "In the Open",
  shortName: "In the Open",
  title: "In the Open — Privacy, open technology, and digital autonomy",
  description:
    "In the Open builds tools, shares news, and brings people together around privacy, open technology, and digital autonomy.",
  tagline: "Privacy, open technology, and digital autonomy.",
  motto: "build // grow // connect",
  locale: "en_US",
  language: "en",
  domain: "intheopen.cc",
  url: "https://intheopen.cc",
  themeColor: "#f7f3e8",
  analytics: {
    plausibleScript: "https://plausible.io/js/pa-j1Z2uUIRXb2OPK2wn8v4i.js",
    umami: {
      script: "https://stats.westech.studio/script.js",
      websiteId: "8b52c36d-a04d-485f-9568-b7f0f0916fca",
    },
  },
  keywords: [
    "privacy",
    "digital rights",
    "open internet",
    "privacy tools",
    "privacy newsletter",
    "technology",
  ],
  links: {
    twitter: "https://x.com/intheopencc",
    newsletter: "https://newsletter.intheopen.cc/",
    feed: "https://newsletter.intheopen.cc/feed",
    paperweight: "https://www.paperweight.email/",
  },
} as const;

export type Site = typeof site;
