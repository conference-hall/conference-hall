import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
  import('./libs/monitoring/monitoring.client.ts').then(({ init }) => init());
}

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
