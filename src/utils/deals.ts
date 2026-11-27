import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Deal {
  title: string;
  description: string;
  deal: string;
  icon: string | null;
  category: string;
  tags: string[];
  url: string;
  code?: string | null;
  expires?: string | null;
  terms?: string | null;
}

export const dealsCheckedAt = "2026-11-27";
export const dealsTitle = "Black Friday privacy deals";
export const dealsDescription =
  "Black Friday offers on privacy tools and services, with discounts, codes, terms, and links to official deal pages.";

export function loadDeals(): Deal[] {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), "data", "deals", "black-friday-2026.json"),
      "utf8",
    ),
  );
}
