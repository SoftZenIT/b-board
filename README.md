# b-board

![Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)

A framework-agnostic virtual keyboard UI library with multi-language support, built for Beninese languages (Yoruba, Fon/Adja, Baatɔnum, Dendi).

## Features

- Desktop and mobile keyboard renderers
- Composition engine for tone marks, nasal marks, and dead keys
- Framework adapters for React, Vue, Angular, and plain JS
- Fully accessible (ARIA, keyboard navigation)
- TypeScript-first with strict typing

## Quick Start

```bash
npm install b-board
```

```ts
import { BBoard } from 'b-board';

const keyboard = new BBoard({
  target: document.querySelector('#my-input'),
  language: 'yo', // Yoruba
});
```

## npm Scripts

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start dev server at localhost:5173    |
| `npm run build`      | Type-check + build library to `dist/` |
| `npm run test`       | Run unit tests in watch mode          |
| `npm run test:ci`    | Run tests once with coverage          |
| `npm run e2e`        | Run Playwright E2E tests              |
| `npm run lint`       | Lint source files                     |
| `npm run type-check` | TypeScript type checking              |
| `npm run format`     | Format code with Prettier             |

## Documentation

- [Development Guide](docs/DEVELOPMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Glossary](docs/GLOSSARY.md)
- [Contributing](CONTRIBUTING.md)

## Status

Currently in **Phase 1** development (data model & core engine). Not yet published to npm.

## License

MIT
