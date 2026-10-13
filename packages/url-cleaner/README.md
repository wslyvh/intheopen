# URL cleaner

Clean one HTTP(S) link with bundled ClearURLs rules. No runtime dependencies or network requests.

## Usage

```ts
import { cleanUrl } from "@intheopen/url-cleaner";

cleanUrl("https://youtu.be/dQw4w9WgXcQ?si=shareIdentifier-123");
// https://youtu.be/dQw4w9WgXcQ
```

Surrounding whitespace is trimmed. Untouched values keep their encoding.
To retain referral attribution, pass `{ preserveReferrals: true }`.

## Notice

Bundled [ClearURLs rules](https://github.com/ClearURLs/Rules/blob/11086f40512774dcadef54079f1ba023bfacf940/data.min.json) retain their upstream LGPL-3.0 licence.
Full [LGPL](licenses/ClearURLs-LGPL-3.0.txt) and [GPL](licenses/GPL-3.0.txt) terms are included; the rules are not MIT licensed.
