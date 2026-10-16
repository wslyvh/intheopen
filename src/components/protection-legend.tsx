import { ProtectionSymbol } from "@/components/protection-level";
import { protectionLevels } from "@/utils/protection-levels";

export function ProtectionLegend() {
  return (
    <section
      aria-labelledby="protection-legend"
      className="border-base-300 mt-12 border-t pt-8"
    >
      <h2 id="protection-legend" className="text-2xl font-medium lowercase">
        what the levels mean
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {protectionLevels.map((level) => (
          <article
            key={level.id}
            className="border-base-300 bg-base-200 border p-5"
          >
            <div className="flex items-center gap-3">
              <ProtectionSymbol level={level.id} />
              <h3 className="font-mono text-sm font-bold">{level.title}</h3>
            </div>
            <p className="mt-3 text-lg font-medium">{level.summary}</p>
            <p className="text-base-content/75 mt-2 text-sm leading-6">
              {level.description}
            </p>
          </article>
        ))}
      </div>
      <p className="text-base-content/75 mt-5 text-sm leading-6">
        Protection levels can depend on settings or plans. Read the project's
        privacy context to get the right level of protection.
      </p>
    </section>
  );
}
