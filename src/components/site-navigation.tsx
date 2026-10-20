import Link from "next/link";

export function SiteNavigation() {
  return (
    <nav
      aria-label="Main"
      className="flex items-center gap-3 font-mono text-sm font-bold lowercase sm:gap-6"
    >
      {[
        { href: "/explore/private-ai", label: "explore" },
        { href: "/tools", label: "tools" },
        { href: "/about", label: "about" },
      ].map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="focus-visible:outline-primary hover:text-primary inline-flex min-h-11 min-w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
