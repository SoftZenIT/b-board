# Memory

## Me
Mohamed (ousmanesadjad@gmail.com), building **BBOARD** — a framework-agnostic virtual keyboard UI library with multi-language support, composition engine, and desktop/mobile rendering.

## Projects
| Name | What | Status | Jira |
|------|------|--------|------|
| **BBOARD** | BJ-Keyboard library — virtual keyboard for web apps | Phase 0 (Setup) | ousmanesadjad.atlassian.net |

→ Details: memory/projects/bboard.md

## Terms
| Term | Meaning |
|------|---------|
| **BBOARD** | BJ-Keyboard — the Jira project key and library name |
| **MCP** | Jira integration via API (used to fetch and update tickets) |
| **Epic** | High-level feature group in Jira (25 total) |
| **Phase 0** | Foundation — project scaffolding, build pipeline, testing setup |
| **Phase 1** | Data model & core engine — types, state machine, composition |
| **Phase 2** | UI & rendering — desktop keyboard, mobile keyboard, themes |
| **Phase 3** | Quality & release — testing, accessibility, security, npm publish |
| **Composition** | Language input logic — tone marks, nasal marks, dead keys |
| **Dead key** | Key that modifies next character (e.g. ´ + a = á) |
| **Tone marks** | Diacritics for tonal languages (e.g. Chinese: ā á ǎ à) |
| **Adapter** | Framework/platform integration layer (React, Vue, Svelte, Browser) |
| **Custom Element** | Web Component API for framework-agnostic usage |

→ Full glossary: memory/glossary.md

## Tech Stack
| Tool | Purpose |
|------|---------|
| **Vite** | Build tool & dev server |
| **Vue 3** | UI framework (primary) |
| **TypeScript** | Language (strict mode) |
| **Vitest** | Unit & integration testing |
| **Playwright** | E2E testing (browser automation) |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

## Jira Structure
| Level | Count | Example |
|-------|-------|---------|
| Epics | 25 | BBOARD-1: Project Foundation |
| Tasks | 194+ | BBOARD-7: Initialize Vite Project |
| Subtasks | Growing | BBOARD-222: Initialize Vite scaffolding |

## Current Phase
**Phase 0 — Project Setup** (in progress)
- Environment not yet initialized
- Next: Run master setup prompt
- Then: Connect Jira MCP + fetch all 194+ tasks
- Then: Begin Phase 1 (Data Model)

## Preferences
- Use TypeScript strict mode always
- Test-driven development (tests before code)
- One task at a time, fully verified before moving on
- Verify with: npm run test + npm run lint + npm run build
- Use Jira MCP to fetch task details before implementing
