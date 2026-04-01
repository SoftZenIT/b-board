# 2. Module Boundaries and Layer Separation

Date: 2026-04-01

## Status

Accepted

## Context

The codebase was previously unstructured, leading to potential circular dependencies and poor maintainability. We needed a strategy to decouple implementation details from public interfaces, specifically to prevent I/O operations from leaking into the core engine logic.

## Decision

We have decided to enforce strict module boundaries using the following layers:
- **Core**: The runtime state machine and engine logic. No dependencies on external I/O.
- **Data**: Responsible for loading and validating language profiles, layouts, and other registry data. It defines a DataLayer interface to abstract actual implementations.
- **Adapters**: Integration points with host targets (e.g., input elements, contenteditables) and an AdapterRegistry to cleanly instantiate them.
- **UI**: UI rendering concerns.
- **Public API**: Everything meant for external consumers is re-exported exclusively via src/public/index.ts. All other imports must remain internal.

We also adopted an _internal directory naming convention for private implementations that are not meant to be imported outside their respective layer.

## Consequences

- Improved testability since each module can be mocked easily (e.g., mocking DataLayer).
- Reduced likelihood of circular dependencies.
- Clearer API surface for library consumers.
- A slight overhead in defining interfaces and maintaining the src/public/index.ts re-exports, but worth the improved maintainability.
