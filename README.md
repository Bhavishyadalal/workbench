# Workbench

An all-in-one personal utility site — image tools, PDF tools, converters,
text/dev tools, and extras, all running client-side in the browser. Built
with Next.js, deployed to Vercel.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploying to Vercel

1. Push this project to a GitHub repo
2. Import the repo at vercel.com/new
3. Vercel auto-detects Next.js — no config needed
4. Deploy

The only server-side piece is `/api/currency`, a serverless function that
proxies live exchange rates (no API key required, uses exchangerate-api.com's
free tier). Everything else — image compression, PDF manipulation, hashing,
QR codes, etc. — runs entirely in the visitor's browser. No files are ever
uploaded anywhere.

## Project docs

See [`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md) for the full design
system reference, file structure guide, and feature roadmap — read that first
before making changes, especially if you're a new AI session picking this up.

## Tools included (35)

**Image:** compress, resize, convert format, crop, rotate/flip, watermark, image→Base64
**PDF:** compress, merge, split, PDF→images, images→PDF, rotate pages, password protect
**Convert:** units, currency (live), timezones, number bases
**Text/dev:** word counter, case converter, JSON formatter, Base64, URL encode/decode, QR generator, Markdown previewer, Lorem ipsum, regex tester, diff checker
**Extras:** password generator, color picker, age/date calculator, timer/stopwatch, random picker, file hash generator
