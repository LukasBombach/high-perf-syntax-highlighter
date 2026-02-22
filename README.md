# high-perf-syntax-highlighter Monorepo

This repository is a `pnpm` workspace with:

- `packages/high-perf-syntax-highlighter`: npm library (publish-ready)
- `apps/playground`: Astro app to use and evolve the library

## Workspace commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## Library package

Path: `packages/high-perf-syntax-highlighter`

Public API:

- `tokenizeToLines(code, options)`
- `renderToRgbaBuffer(input)`
- `renderToDataUrl(input)`
- `attachTextarea(textarea, options)`

Build and test:

```bash
pnpm --filter high-perf-syntax-highlighter build
pnpm --filter high-perf-syntax-highlighter test
pnpm --filter high-perf-syntax-highlighter test:browser
```

## Playground app

Path: `apps/playground`

```bash
pnpm --filter playground dev
```

The app consumes the local workspace package via `workspace:*`.

## Publish flow

```bash
pnpm --filter high-perf-syntax-highlighter build
pnpm --filter high-perf-syntax-highlighter test
pnpm --filter high-perf-syntax-highlighter test:browser
pnpm --filter high-perf-syntax-highlighter pack
```
