# Feature flags

## Getting started

Feature flags are declared in the `flags.config.ts` file.

```ts
import { defineFlagsConfig } from './app/libs/feature-flags/flags-client';

export default defineFlagsConfig({
  seo: {
    description: 'Enables SEO features like sitemap.xml and robots.txt',
    type: 'boolean',
    defaultValue: false,
    tags: ['frontend'] as const,
  },
  // Other flags...
});
```

A flag can be a `boolean`, a `number` or a `string` value.

To use a flag in the backend just do:

```js
import { flags } from '~/libs/feature-flags/flags.server.ts';

const myFlag = await flags.get('my-flag-name');
```

To use a flag in the frontend, use the hook `useFlag`, only flags defined with `frontend` tag are available:

```js
import { useFlag } from '~/routes/components/contexts/flags-context.tsx';

const myFlag = useFlag('my-flag-name');
```

As admin in Conference Hall, you can manage flags in `http://localhost:3000/admin/flags`.

## Development

When a new flag is added, you need to restart the dev server.

## Tests with flags

In unit/integration/e2e tests, the `defaultValue` are automatically set to all flags. The flags are reset to the `defaultValue` between each tests.

**To change a flag in unit/integration tests:**

```js
import { flags } from '~/libs/feature-flags/flags.server.ts';

test('my test when flags is off', async () => {
  await flags.set('my-flag-name', false);
  // my test...
});
```

