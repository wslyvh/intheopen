import type { NextConfig } from "next";

const hostedFullModelUrl =
  "https://pub-5d75dd17d4b344089eaf9eda0232fdbc.r2.dev/tools/masker-full/a207f14a31c7/int4-8303f93e-50a51293/";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MAGPII_FULL_MODEL_URL:
      process.env.NEXT_PUBLIC_MAGPII_FULL_MODEL_URL ?? hostedFullModelUrl,
  },
};

export default nextConfig;
