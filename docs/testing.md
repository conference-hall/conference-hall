---
description: Testing patterns and conventions
paths:
  - tests/**
  - e2e/**
  - '**/*.test.*'
---

# Testing Conventions

## General

- Unit/integration tests: Vitest — `pnpm test` runs `test:db` (push schema) then `test:unit` (Vitest)
- Single test file: `pnpm test run "<file path>"`
- E2E: Playwright (`pnpm test:e2e`), requires Docker running
- All Vitest functions (`describe`, `it`, `expect`, `vi`, `beforeEach`, etc.) globally available — do not import them
- Test names start with verbs, not "should" (e.g., `it('returns the profile')`)
- No comments in tests — write clean, self-documenting code
- All mocks auto-reset between tests (`mockReset: true`)
- No need for `vi.clearAllMocks()` in beforeEach when mocking

## Unit/Integration Tests (`.test.ts`)

- Use factory functions for test data — never create records with Prisma directly
- DB globally truncated after each test — no manual cleanup or `TRUNCATE TABLE`
- Import factories from `tests/factories/`: `import { userFactory } from 'tests/factories/users.ts'`
- Mock dates: `vi.useFakeTimers()` + `vi.setSystemTime(new Date('2023-01-01'))`, restore with `vi.useRealTimers()` in `afterEach`
- Mock modules: `vi.mock('~/path/to/module.ts', () => ({ ... }))`
- Jobs globally mocked in `tests/setup.server.ts` — no per-test mocking needed
- Async error assertions: `rejects.toThrowError(ErrorClass)`
- After creating test, ALWAYS execute: `pnpm test run "<file path>"`

## Component Tests (`.test.tsx`)

- Use `render` from `vitest-browser-react` (imported via `tests/setup.browser.tsx`)
- Render: `page.render(<Component />)` from `vitest/browser`
- Use `createRoutesStub` from `react-router` for routing-dependent components
- Wrap i18n-dependent components with `<I18nextProvider i18n={i18nTest}>` (from `tests/i18n-helpers.tsx`)
- Check text with English i18n values, not translation keys
- Semantic queries: `page.getByRole()`, `page.getByLabel()`, `page.getByText()`, `page.getByPlaceholder()`
- Element assertions: `await expect.element(locator)` (not `expect(locator)`)
- Interactions: `userEvent` from `vitest/browser`: `await userEvent.click()`, `await userEvent.type()`
- After creating test, ALWAYS execute: `pnpm test run "<file path>"`

## Factories

- In `tests/factories/` with trait-based system
- Traits are predefined attribute sets: `await userFactory({ traits: ['clark-kent', 'admin'] })`
- Custom attributes override defaults: `await userFactory({ attributes: { name: 'Jane' } })`
- Auth options: `withPasswordAccount: true` creates credential account, `withSocialAccount: true` creates Google account

## E2E Tests (Playwright)

- In `e2e/` with Page Object pattern
- Import `test` and `expect` from `e2e/fixtures.ts` (not Playwright directly)
- DB reset before each test via custom fixture in `e2e/fixtures.ts`
- Authenticated tests: `userLoggedFactory(context, options)` from `e2e/helpers.ts` — creates user + sets auth cookies via better-auth test utilities
- Page objects extend `PageObject` base class from `e2e/page-object.ts`
- Each page MUST have page object for locators, actions (never expectations)
- New page element selectors → create locator or function in page object
- After creating test, ALWAYS execute: `pnpm test:e2e "<file path>"`

### Page Object Structure

- `readonly` locator properties
- `goto()` for navigation, `waitFor()` for page readiness
- `waitForHydration()` (base class) to wait for React hydration
- Return new page objects from navigation actions (e.g., `clickOnEvent()` returns `EventPage`)
- Semantic locators: `getByRole()`, `getByLabel()`, `getByText()`
- Base class helpers: `fill()`, `radioInput()`, `checkboxInput()`, `multiSelectInput()`
