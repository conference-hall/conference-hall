import { RemixBrowser } from '@remix-run/react';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { initMonitoring } from './libs/monitoring/monitoring.client.ts';

initMonitoring();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
