# BBOARD Maintainability Checklist

Run this checklist before creating a PR. Automated items are enforced by CI — manual items are checked in code review.

---

## Automated (CI enforces — PR will fail if violated)

- [ ] `npm run lint` passes — ESLint + module boundary rules clean
- [ ] `npm run type-check` passes — TypeScript strict mode, no errors
- [ ] `npm run test:ci` passes — all tests green
- [ ] Coverage thresholds met — ≥90% lines/functions/statements, ≥85% branches
- [ ] `npm run validate:data` passes — all JSON data files valid against schemas
- [ ] `npm run build` succeeds — ESM + UMD bundles produced

---

## Manual (code review checks)

### Code Quality
- [ ] No `any` types — use `unknown` + type guards at boundaries
- [ ] No `// @ts-ignore` or `// @ts-expect-error` without explanation
- [ ] No hardcoded values that should be constants
- [ ] No `TODO` comments — create a Jira ticket instead
- [ ] Error messages follow `[Module] Action: detail` format (see `docs/ERROR_MESSAGE_STANDARDS.md`)

### Documentation
- [ ] All exported functions/types have TSDoc (see `docs/TSDOC_STANDARDS.md`)
- [ ] `@throws` documented for every function that throws
- [ ] New `@example` uses factory functions, not raw object literals

### Testing
- [ ] Tests co-located with source (`module.test.ts` next to `module.ts`)
- [ ] Test names follow `it('should [behavior] when [condition]')` or noun form
- [ ] No mutations of shared fixtures — always spread
- [ ] `vi.stubGlobal` calls cleaned up in `afterEach`

### Architecture
- [ ] Module boundary rules respected (see `docs/MODULE_BOUNDARIES.md`)
- [ ] New files placed in the correct module directory
- [ ] No circular imports between modules
- [ ] Significant architectural decisions captured in `docs/adr/`

---

## References

- Code style: `docs/CODE_STYLE.md`
- Module boundaries: `docs/MODULE_BOUNDARIES.md`
- TSDoc standards: `docs/TSDOC_STANDARDS.md`
- Test standards: `docs/TEST_STANDARDS.md`
- Error messages: `docs/ERROR_MESSAGE_STANDARDS.md`
- ADR process: `docs/adr/ADR_TEMPLATE.md`
