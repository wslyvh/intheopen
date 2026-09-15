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
