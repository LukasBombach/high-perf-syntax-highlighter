# high-perf-syntax-highlighter

DOM-light syntax highlighter that renders token colors into a tiny pixel image and applies it as `background-image`.

## API

- `tokenizeToLines(code, options)`
- `renderToRgbaBuffer(input)`
- `renderToDataUrl(input)`
- `attachTextarea(textarea, options)`

## Development

```bash
pnpm --filter high-perf-syntax-highlighter build
pnpm --filter high-perf-syntax-highlighter test
pnpm --filter high-perf-syntax-highlighter test:browser
```
