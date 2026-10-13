# @intheopen/url-cleaner

Clean one HTTP(S) URL. Text in, text out. No runtime dependencies or network calls.

```ts
import { cleanUrl } from "@intheopen/url-cleaner";

cleanUrl("https://example.org/article?utm_source=mail&id=123");
// https://example.org/article?id=123

// Optional: preserve fields classified as referral marketing.
cleanUrl(url, { preserveReferrals: true });
```

Uses bundled ClearURLs rules and exceptions for query and fragment parameters,
raw URL rewrites and embedded redirect destinations. Does not fetch short links
or block domains. Untouched query values retain their encoding and order.

Surrounding whitespace is trimmed from HTTP(S) links before cleaning. Internal
whitespace and encoded values are not rewritten. Invalid input is returned
unchanged. Recognised AWS, Google Cloud, Azure SAS and CloudFront signed links
keep their URL content unchanged. Other signing schemes may not be recognised.
Cleaning removes matched baggage; it does not verify the destination or make a
link safe to open.

## Development

From the repository root:

```sh
npm test --prefix packages/url-cleaner
npm run update-rules --prefix packages/url-cleaner
npm test --prefix packages/url-cleaner
```

Only the explicit update command makes network requests. It bundles the current
upstream snapshot and licence. Pass a full commit SHA to select a specific
snapshot. Review changes and tests before releasing.

The package is local and unpublished. Rules retain their upstream LGPL licence;
see LICENSE and NOTICE.txt.
