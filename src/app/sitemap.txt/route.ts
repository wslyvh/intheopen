import sitemap from "@/app/sitemap";

export const dynamic = "force-static";

export function GET() {
  return new Response(
    sitemap()
      .map(({ url }) => url)
      .join("\n") + "\n",
    {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    },
  );
}
