import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/utils/site";

const footerLinks = [
  { href: site.links.twitter, label: "twitter" },
  { href: site.links.newsletter, label: "newsletter" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
        <p className="text-primary font-mono text-xs font-bold lowercase sm:text-sm">
          build / grow / connect
        </p>
        <nav className="flex gap-5" aria-label="Footer links">
          <Link
            href="/about"
            className="hover:text-primary focus-visible:outline-primary inline-flex items-center font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            about
          </Link>
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary focus-visible:outline-primary inline-flex items-center gap-1 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {link.label}
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
