import Image from "next/image";
import Link from "next/link";
import { site } from "@/utils/site";

export function PageHeader() {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
      <Link
        href="/"
        className="focus-visible:outline-primary inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label={`${site.name} home`}
      >
        <Image
          src="/images/logo.png"
          alt={site.name}
          width={1000}
          height={195}
          className="h-auto w-36"
        />
      </Link>
    </header>
  );
}
