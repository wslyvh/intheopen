import type { ReactNode } from "react";
import Image from "next/image";
import { ProtectionBadge } from "@/components/protection-level";
import Link from "next/link";
import { ProtectionLegend } from "@/components/protection-legend";
import {
  ArrowUpRight,
  CircleDollarSign,
  Globe,
  Monitor,
  Smartphone,
  UserRound,
} from "lucide-react";
import {
  categoryCopy,
  featureLabels,
  platformLabels,
  pricingLabels,
  protectionLevels,
  type Project,
} from "@/utils/explore";

const textLink =
  "hover:text-base-content/75 focus-visible:outline-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";
const metadataBadge =
  "text-base-content/75 bg-base-content/5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs whitespace-nowrap";

const pageTitle =
  "mt-4 text-5xl leading-none font-medium tracking-[-0.04em] sm:text-7xl";
const sectionTitle = "text-2xl font-medium lowercase";
const projectSurface =
  "group border-base-300 bg-base-200 hover:bg-base-300/40 focus-visible:outline-primary border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";

function FactValues({ values }: { values: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {values.map((value) => (
        <li key={value} className={metadataBadge}>
          {value}
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/explore/${project.id}`}
      aria-labelledby={`${project.id}-title`}
      className={`${projectSurface} relative flex items-start gap-4 p-4 sm:gap-6 sm:p-6`}
    >
      <div className="bg-base-100 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md sm:size-20">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            width={80}
            height={80}
            sizes="(min-width: 640px) 80px, 48px"
            className="size-full object-contain"
          />
        ) : (
          <span className="text-base-content/75 text-2xl font-medium">
            {project.name[0]}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            id={`${project.id}-title`}
            className="text-lg font-medium sm:text-xl"
          >
            {project.name}
          </h3>
          <ProtectionBadge level={project.protection_level} />
        </div>
        <p className="text-base-content/75 mt-2 text-sm leading-6 sm:text-base">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {project.account_required === false && (
            <span className={metadataBadge}>
              <UserRound className="size-3.5" aria-hidden="true" /> No account
              required
            </span>
          )}
          {project.platforms.map((platform) => {
            const Icon =
              platform === "web"
                ? Globe
                : platform === "android" || platform === "ios"
                  ? Smartphone
                  : Monitor;
            return (
              <span key={platform} className={metadataBadge}>
                <Icon className="size-3.5" aria-hidden="true" />{" "}
                {platformLabels[platform] ?? platform}
              </span>
            );
          })}
          <span className={metadataBadge}>
            <CircleDollarSign className="size-3.5" aria-hidden="true" />{" "}
            {pricingLabels[project.pricing]}
          </span>
        </div>
      </div>
      <ArrowUpRight
        className="text-base-content/55 pointer-events-none absolute right-2 bottom-1 size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:size-4"
        aria-hidden="true"
      />
    </Link>
  );
}

export function CategoryProjects({
  slug,
  projects,
}: {
  slug: string;
  projects: Project[];
}) {
  const copy = categoryCopy(slug);
  return (
    <>
      <h1 className={`${pageTitle} lowercase`}>{copy.title}</h1>
      <p className="text-base-content/75 mt-6 max-w-2xl text-lg leading-8">
        {copy.description}
      </p>
      {protectionLevels.map((level) => {
        const members = projects
          .filter((project) => project.protection_level === level.id)
          .sort((a, b) => a.name.localeCompare(b.name, "en"));
        if (!members.length) return null;
        return (
          <section
            key={level.id}
            aria-labelledby={`level-${level.id}`}
            className="mt-12"
          >
            <h2 id={`level-${level.id}`} className={sectionTitle}>
              {level.title}
            </h2>
            <div className="mt-5 grid gap-3">
              {members.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        );
      })}
      <ProtectionLegend />
    </>
  );
}

function TwitterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723 9.99 9.99 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.98 13.98 0 0 1 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.061a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.42 9.887 9.887 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.054 0 14-7.503 14-14 0-.21 0-.42-.015-.63A10.013 10.013 0 0 0 24 4.59z" />
    </svg>
  );
}

export function ProjectProfile({
  project,
  alternatives,
}: {
  project: Project;
  alternatives: Project[];
}) {
  const links = [
    {
      label: "Website",
      url: project.links.website,
    },
    { label: "Twitter", url: project.links.twitter, icon: <TwitterIcon /> },
    { label: "Privacy policy", url: project.links.privacy_policy },
    { label: "Terms", url: project.links.terms },
  ];
  const about: [string, ReactNode][] = [
    ["Operator", project.operator ?? "Unknown"],
    ["Country", project.country ?? "Unknown"],
    [
      "Code license",
      <div key="license">
        {project.license ?? "Unknown"}
        {project.links.github && (
          <a
            className={`${textLink} mt-1 block w-fit text-sm`}
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source code ↗
          </a>
        )}
      </div>,
    ],
  ];
  const capabilities: [string, ReactNode][] = [
    [
      "Features",
      <FactValues
        key="features"
        values={project.features.map(
          (feature) => featureLabels[feature] ?? feature,
        )}
      />,
    ],
    [
      "Platforms",
      <FactValues
        key="platforms"
        values={project.platforms.map(
          (platform) => platformLabels[platform] ?? platform,
        )}
      />,
    ],
    ["Pricing", pricingLabels[project.pricing]],
  ];
  return (
    <>
      <h1 className={pageTitle}>{project.name}</h1>
      <p className="text-base-content/75 mt-6 max-w-2xl text-lg leading-8">
        {project.description}
      </p>
      <div className="mt-7">
        <nav
          aria-label="Project links"
          className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm"
        >
          {links
            .filter((link) => link.url)
            .map((link) => (
              <a
                key={link.label}
                href={link.url!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className={
                  link.label === "Website"
                    ? "btn btn-primary font-mono"
                    : `${textLink} inline-flex items-center gap-2`
                }
              >
                {link.label === "Twitter" ? link.icon : link.label}
              </a>
            ))}
          <span className={metadataBadge}>
            <UserRound className="size-3.5" aria-hidden="true" />
            {project.account_required === null
              ? "Account requirement unknown"
              : project.account_required
                ? "Account required"
                : "No account required"}
          </span>
        </nav>
      </div>
      <section
        aria-label="Project facts"
        className="bg-base-200 mt-10 p-5 sm:p-7"
      >
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {[...about, ...capabilities].map(([label, value]) => (
            <div key={label}>
              <dt className="text-base-content/75 font-mono text-xs">
                {label}
              </dt>
              <dd className="mt-2 text-base leading-7">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="project-privacy" className="mt-10">
        <div className="flex flex-wrap items-center gap-4">
          <h2 id="project-privacy" className={sectionTitle}>
            privacy
          </h2>
          <ProtectionBadge level={project.protection_level} />
        </div>
        <ul className="marker:text-base-content/40 mt-6 max-w-3xl list-disc space-y-4 pl-5 text-base leading-7">
          {project.privacy.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        {project.privacy.notes && (
          <div className="bg-base-200 border-base-300 mt-6 max-w-3xl border-l-2 p-5">
            <h3 className="text-base-content/75 font-mono text-xs">
              Privacy context
            </h3>
            <p className="text-base-content/75 mt-2 text-base leading-7">
              {project.privacy.notes}
            </p>
          </div>
        )}
        <p className="text-base-content/75 mt-6 text-sm">
          Reviewed{" "}
          <time dateTime={project.checked_at}>{project.checked_at}</time>
        </p>
      </section>
      {alternatives.length > 0 && (
        <section
          aria-labelledby="project-alternatives"
          className="border-base-300 mt-12 border-t pt-8"
        >
          <h2
            id="project-alternatives"
            className="text-2xl leading-8 font-medium"
          >
            {project.name} alternatives
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {alternatives.map((alternative) => (
              <Link
                key={alternative.id}
                href={`/explore/${alternative.id}`}
                className={`${projectSurface} relative flex min-w-0 items-start gap-3 p-4`}
              >
                {alternative.image && (
                  <Image
                    src={alternative.image}
                    alt=""
                    width={40}
                    height={40}
                    sizes="40px"
                    className="size-10 shrink-0 rounded-md object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-medium">
                      {alternative.name}
                    </h3>
                    <ProtectionBadge level={alternative.protection_level} />
                  </div>
                  <p className="text-base-content/75 mt-1 truncate pr-5 text-sm">
                    {alternative.description}
                  </p>
                </div>
                <ArrowUpRight
                  className="text-base-content/55 pointer-events-none absolute right-3 bottom-3 size-4"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
      <ProtectionLegend />
    </>
  );
}
