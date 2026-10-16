import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import {
  protectionLevels,
  type ProtectionLevel,
} from "@/utils/protection-levels";

export { protectionLevels } from "@/utils/protection-levels";

export interface Project {
  id: string;
  name: string;
  image?: string;
  description: string;
  links: {
    website: string;
    github: string | null;
    twitter: string | null;
    privacy_policy: string | null;
    terms: string | null;
  };
  license: string | null;
  operator: string | null;
  country: string | null;
  pricing: "free" | "freemium" | "paid";
  features: string[];
  platforms: string[];
  account_required: boolean | null;
  protection_level: ProtectionLevel;
  privacy: {
    highlights: string[];
    notes: string;
  };
  research_notes: string[];
  sources: string[];
  checked_at: string;
}

const dataDirectory = join(process.cwd(), "data");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ExploreCategory {
  slug: string;
  projects: Project[];
}

export function loadCategories(): ExploreCategory[] {
  const categories = readdirSync(dataDirectory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const slug = basename(file, ".json");
      const projects: Project[] = JSON.parse(
        readFileSync(join(dataDirectory, file), "utf8"),
      );
      if (!slugPattern.test(slug) || !Array.isArray(projects)) {
        throw new Error(`Invalid Explore category: ${file}`);
      }
      return { slug, projects };
    });
  const usedSlugs = new Set(categories.map((category) => category.slug));
  for (const { projects } of categories) {
    for (const project of projects) {
      if (
        typeof project.id !== "string" ||
        !slugPattern.test(project.id) ||
        usedSlugs.has(project.id) ||
        !protectionLevels.some((level) => level.id === project.protection_level)
      ) {
        throw new Error(`Invalid or duplicate Explore project: ${project.id}`);
      }
      usedSlugs.add(project.id);
    }
  }
  return categories;
}

export function getExploreEntry(slug: string) {
  const categories = loadCategories();
  const category = categories.find((entry) => entry.slug === slug);
  if (category) return { category };
  for (const category of categories) {
    const project = category.projects.find((entry) => entry.id === slug);
    if (project) return { category, project };
  }
  return undefined;
}

export function categoryCopy(slug: string) {
  if (slug === "private-ai") {
    return {
      title: "Private AI",
      description:
        "Explore AI assistants and learn who can access your messages, how history is protected, and which settings matter.",
    };
  }
  return {
    title: slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description: "Explore projects and their privacy protections.",
  };
}

export const platformLabels: Record<string, string> = {
  web: "Web",
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
  ios: "iOS",
};
export const pricingLabels = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
};
export const featureLabels: Record<string, string> = {
  chat: "Chat",
  documents: "Documents",
  search: "Web search",
  images: "Image creation",
  agents: "Multi-step tasks",
};
