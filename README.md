# In the Open

The public website for [In the Open](https://intheopen.cc): privacy, open technology, and digital autonomy.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run build
npm run check
npm run format
```

## Structure

All application code lives in `src`, divided into `app`, `components`, `providers`, and `utils`. Public site names, descriptions, and social links live in `src/utils/site.ts`.

Upcoming events are a public snapshot of approved records from the private `intheopen-engine` repository. Update `src/utils/events.json` when that source changes; the events page filters expired entries at request time.

## Privacy tools and Magpii

`/tools` lists our privacy tools. The text redactor consumes `@intheopen/magpii` from a local release archive in `vendor/`. Magpii owns the engine, models, runtime, packaging, and engine tests; ITO owns the pages, editor, review controls, and clipboard integration.

`npm run dev` and `npm run build` install the package's browser assets into the ignored `public/magpii/` directory. No SDK or model source is maintained here. See `../magpii/README.md` for SDK development and release instructions.

Run the editor regression tests against a production build. They cover preserving reviewed results, canceling stale runs, protecting manual edits, and clipboard feedback. A worker fixture supplies contextual detection without loading model assets.

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Alternatively set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable.
