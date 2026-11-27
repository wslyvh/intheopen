import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Deal {
  title: string;
  description: string;
  deal: string;
  icon: string | null;
  category: string;
  lifetime: boolean;
  url: string;
  code: string | null;
}

export const dealsTitle = "Black Friday privacy deals";
export const dealsDescription =
  "Black Friday offers on privacy tools and services. Browse by category and follow each deal to its official page.";

export function loadDeals(): Deal[] {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), "data", "deals", "black-friday-2026.json"),
      "utf8",
    ),
  );
}
