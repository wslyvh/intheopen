import { ArrowUpRight } from "lucide-react";
import { magpii } from "@/utils/magpii";

export function MagpiiLinks() {
  const links = [
    magpii.chromeWebStore
      ? {
          href: magpii.chromeWebStore,
          label: "Chrome Web Store",
          external: true,
        }
      : null,
    { href: magpii.github, label: "GitHub", external: true },
  ].filter((link) => link !== null);

  return (
    <nav
      className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
      aria-label="Magpii links"
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary focus-visible:outline-primary inline-flex items-center gap-1 font-mono text-sm font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {link.label}
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
