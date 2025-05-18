Write all TypeScript code using single quotes and 2-space indentation to maintain consistency across our codebase.

Our primary web framework is "React Router v7", and it’s served by an Express server, so structure any backend or routing suggestions accordingly.

We use Prisma as our ORM, so ensure that all database queries and models follow Prisma's syntax and conventions.

For asynchronous jobs, rely on BullMQ and use our custom abstraction layer to manage job queues and processing.

Components are styled using Tailwind CSS, so any styling suggestions should be compatible with Tailwind's utility-first approach.

Our tests are run with Vitest (never use `jest`), so please structure all test-related code and examples to align with Vitest’s syntax and best practices.

No need to import Vitest functions and helpers, they are declared globally.

Test names must not start with "should" but with a verb.

All javascript and typescript file imports includes the file extensions (ex: import { Example } from './example.ts' ), use this syntax for the suggestions.

Prefer named exports over default exports, use this convention for the suggestions.

To run a single test file, use the command `npm test -- run <file>`, and to run all tests, use `npm test -- run` without any arguments.

Integration tests for React components: should be placed in the same directory as the component itself, and they should be named with a `.test.tsx` suffix.
Integration tests for React components: should be rendered using the `render` function from `vitest-browser-react` and should use the `screen` object from `render` to query elementIntegration tests for React components, For example, use `screen.getByText('example')` instead of `getByText('example')`.
Integration tests for React components: if components uses `react-router` components, it should be wrapped using RouteStub component from `createRoutesStub`.
Integration tests for React components: if components uses i18n, it should be wrapped with `I18nextProvider` component from `react-i18next` using `i18nTest` config from `tests/i18n-helpers.tsx`.

Integration tests for backend code should be placed in the same directory as the file itself, and they should be named with a `.test.ts` suffix.

To mock dates in tests, use `vi.useFakeTimers` and `vi.setSystemTime(new Date('2023-01-01'))` to set the date to January 1, 2023. This ensures that all date-related functionality in the tests is consistent and predictable.
