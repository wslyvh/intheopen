import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { magpii } from "@/utils/magpii";

const buttonClass =
  "focus-visible:outline-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";

export function MagpiiLinks() {
  const links = [
    magpii.chromeWebStore
      ? {
          href: magpii.chromeWebStore,
          label: "Chrome Web Store",
        }
      : null,
    { href: magpii.github, label: "GitHub" },
  ].filter((link) => link !== null);

  return (
    <nav className="mt-10 flex flex-wrap gap-3" aria-label="Magpii links">
      <Link
        href="/tools/text-redaction"
        className={`${buttonClass} bg-primary text-primary-content hover:bg-primary/85`}
      >
        try it
      </Link>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} border-base-content/20 hover:bg-base-200 border`}
        >
          {link.label}
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
