# URL cleaner

Clean one HTTP(S) link locally. No runtime dependencies or network requests.

Matches links against bundled ClearURLs rules and exceptions to remove tracking fields from query strings, URL fragments and paths. Redirect destinations embedded in a link can be extracted without opening or fetching it.

## Usage

```ts
import { cleanUrl } from "@intheopen/url-cleaner";

cleanUrl("https://youtu.be/dQw4w9WgXcQ?si=shareIdentifier-123");
// https://youtu.be/dQw4w9WgXcQ

// Keep referral attribution while removing other tracking.
cleanUrl(link, { allowReferrals: true });
```

## Notice

- Bundled [ClearURLs](https://www.clearurls.xyz/) rules ([LGPL-3.0](https://github.com/ClearURLs/Rules/blob/11086f40512774dcadef54079f1ba023bfacf940/LICENSE)).
