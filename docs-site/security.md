# Security Policy

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues via [GitHub Security Advisories](https://github.com/SoftZenIT/b-board/security/advisories/new) (private disclosure). We will acknowledge within 72 hours and coordinate a fix and disclosure timeline with you.

## Supported versions

Only the latest published version on npm receives security fixes.

| Version | Supported |
| ------- | --------- |
| Latest  | ✅        |
| Older   | ❌        |

## Scope

b-board is a UI library with no server-side component. The attack surface is limited to:

- Input sanitization in the keyboard engine
- DOM insertion operations
- Event handling

Out of scope: issues in your application's own code, third-party dependencies unrelated to b-board.
