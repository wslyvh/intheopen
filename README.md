# In the Open

The public website for [In the Open](https://intheopen.cc): privacy, open technology, and digital autonomy.

## Getting started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run build
npm run check
npm run format
```

## Text redaction SDK

The website owns the editor and its integration. Detection, masking, model files, and browser runtime come from the compiled SDK archive in `vendor/`. `npm ci` installs it, and `npm run build` prepares its browser assets automatically.

After replacing the archive, refresh the dependency lock and rebuild:

```bash
npm install ./vendor/intheopen-magpii-0.2.0.tgz
npm run build
```
