import catalog from "./rules.json" with { type: "json" };

const providers = Object.values(catalog.providers).map((provider) => ({
  pattern: new RegExp(provider.urlPattern, "i"),
  exceptions: provider.exceptions.map((rule) => new RegExp(rule, "i")),
  rules: provider.rules.map((rule) => new RegExp(`^(?:${rule})$`, "i")),
  referrals: provider.referralMarketing.map(
    (rule) => new RegExp(`^(?:${rule})$`, "i"),
  ),
  rawRules: provider.rawRules.map((rule) => new RegExp(rule, "gi")),
  redirections: provider.redirections.map((rule) => new RegExp(rule, "i")),
  completeProvider: provider.completeProvider,
}));

function isUrl(value: string): boolean {
  if (/[\s\u0000]/.test(value)) return false;
  try {
    return (
      /^https?:\/\//i.test(value) && /^https?:$/.test(new URL(value).protocol)
    );
  } catch {
    return false;
  }
}

function removeFields(
  value: string,
  rules: RegExp[],
  referrals: RegExp[],
  preserveReferrals: boolean,
): string {
  return value
    .split("&")
    .filter((field) => {
      const key = decodeURIComponent(
        field.split("=", 1)[0].replace(/\+/g, " "),
      );
      if (referrals.some((rule) => rule.test(key))) return preserveReferrals;
      return !rules.some((rule) => rule.test(key));
    })
    .join("&");
}

function cleanProvider(
  url: string,
  provider: (typeof providers)[number],
  preserveReferrals: boolean,
): string {
  for (const rule of provider.redirections) {
    const match = rule.exec(url);
    if (match?.[1]) {
      const destination = decodeURIComponent(match[1]);
      if (isUrl(destination)) return destination;
    }
  }
  // Blocking advertising endpoints is not URL cleaning.
  if (provider.completeProvider) return url;
  let result = url;
  for (const rule of provider.rawRules) result = result.replace(rule, "");
  if (!isUrl(result)) return url;
  const hash = result.indexOf("#");
  const fragment = hash < 0 ? "" : result.slice(hash + 1);
  const base = hash < 0 ? result : result.slice(0, hash);
  const query = base.indexOf("?");
  const originalFields = query < 0 ? "" : base.slice(query + 1);
  const fields = removeFields(
    originalFields,
    provider.rules,
    provider.referrals,
    preserveReferrals,
  );
  const cleanedFragment = removeFields(
    fragment,
    provider.rules,
    provider.referrals,
    preserveReferrals,
  );
  return (
    (query < 0
      ? base
      : base.slice(0, query) +
        (fields || fields === originalFields ? `?${fields}` : "")) +
    (hash < 0
      ? ""
      : cleanedFragment || cleanedFragment === fragment
        ? `#${cleanedFragment}`
        : "")
  );
}

function isSigned(url: string): boolean {
  const keys = new Set(
    [...new URL(url).searchParams.keys()].map((key) => key.toLowerCase()),
  );
  return (
    keys.has("x-amz-signature") ||
    keys.has("x-goog-signature") ||
    (keys.has("sig") && keys.has("sv") && keys.has("se")) ||
    (keys.has("signature") &&
      keys.has("key-pair-id") &&
      (keys.has("expires") || keys.has("policy")))
  );
}

/** Trim surrounding whitespace and clean one HTTP(S) URL locally. */
export function cleanUrl(
  input: string,
  options: { preserveReferrals?: boolean } = {},
): string {
  const trimmed = input.trim();
  if (!isUrl(trimmed)) return input;
  input = trimmed;
  try {
    if (isSigned(input)) return input;
    let url = input;
    // Bound repeated cleaning of nested tracking wrappers.
    for (let pass = 0; pass < 10; pass++) {
      const previous = url;
      for (const provider of providers) {
        if (
          !provider.pattern.test(url) ||
          provider.exceptions.some((rule) => rule.test(url))
        )
          continue;
        const cleaned = cleanProvider(
          url,
          provider,
          options.preserveReferrals ?? false,
        );
        if (cleaned !== url && isSigned(cleaned)) return cleaned;
        url = cleaned;
      }
      if (url === previous) break;
    }
    return url;
  } catch {
    return input;
  }
}
