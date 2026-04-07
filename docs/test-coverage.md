# Test Coverage Report

## Current Coverage

| Metric     | Coverage | Threshold | Status  |
| ---------- | -------- | --------- | ------- |
| Statements | 98.49%   | 90%       | ✅ Pass |
| Branches   | 91.33%   | 85%       | ✅ Pass |
| Functions  | 97.92%   | 90%       | ✅ Pass |
| Lines      | 98.69%   | 90%       | ✅ Pass |

## Module Coverage Breakdown

| Module              | Lines   | Branches | Functions | Statements |
| ------------------- | ------- | -------- | --------- | ---------- |
| src/composition     | 100%    | 100%     | 100%      | 100%       |
| src/core/\_internal | 100%    | 100%     | 100%      | 100%       |
| src/data            | 100%    | 96%      | 100%      | 100%       |
| src/element         | 100%    | 100%     | 100%      | 100%       |
| src/adapters        | 100%    | 88.23%   | 100%      | 100%       |
| src/security        | 95-100% | varies   | 95-100%   | 95-100%    |
| src/theme           | 96%     | 90.9%    | 96%       | 96%        |
| src/ui/desktop      | 98.24%  | 88.57%   | 98%       | 98.24%     |
| src/ui/mobile       | 97.59%  | 89.23%   | 97%       | 97.59%     |
| src/ui/state        | 93.02%  | 83.33%   | 93%       | 93.02%     |
| src/utils           | 100%    | 66.66%   | 100%      | 100%       |

## Coverage Exclusions

The following files are excluded from coverage measurement:

- `src/**/index.ts` — Barrel files with no logic
- `src/main.ts`, `src/App.vue` — Dev-only app scaffolding
- `src/**/*.types.ts` — Pure TypeScript type definitions (no runtime code)
- `src/element/benin-keyboard.ts` — Lit web component with render templates; behavior covered by E2E tests

## Coverage Hot Spots

Areas with the lowest branch coverage that could benefit from additional tests:

1. **src/utils/logger.ts** (66.66% branches) — Logging branches for different log levels
2. **src/ui/state/focus-controller.ts** (83.33% branches) — Edge cases in focus management
3. **src/adapters/** (88.23% branches) — Some adapter boundary conditions

## How to Read Reports

```bash
npm run test:coverage    # Generate report
open coverage/index.html # Open HTML report
```

The HTML report shows line-by-line coverage with color coding:

- **Green:** Covered lines
- **Red:** Uncovered lines
- **Yellow:** Partially covered branches

Click on any file to see detailed coverage for that module.

## How to Improve Coverage

1. Look at uncovered branches in the HTML report
2. Write tests targeting those specific branches
3. Focus on meaningful coverage — test behavior, not implementation details
4. Use the fixture factories in `src/tests/fixtures/` for consistent test data
