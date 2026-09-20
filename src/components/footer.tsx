import { ArrowUpRight } from "lucide-react";
import { outboundEvent } from "@/utils/analytics";
import { site } from "@/utils/site";

const footerLinks = [
  { href: site.links.twitter, label: "twitter", target: "twitter" },
  {
    href: site.links.newsletter,
    label: "newsletter",
    target: "newsletter",
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <p className="text-primary font-mono text-xs font-bold lowercase sm:text-sm">
          build / grow / connect
        </p>
        <nav className="flex gap-5" aria-label="Social links">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary focus-visible:outline-primary inline-flex items-center gap-1 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              {...outboundEvent({
                target: link.target,
                placement: "footer",
              })}
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
