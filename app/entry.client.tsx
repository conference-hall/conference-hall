import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { HydratedRouter } from 'react-router/dom';
import { initializeI18n } from './shared/i18n/i18n.browser.ts';

declare global {
  interface Window {
    __APP_HYDRATED__?: boolean;
  }
}

async function hydrate() {
  try {
    const i18n = await initializeI18n();

    startTransition(() => {
      hydrateRoot(
        document,
        <I18nextProvider i18n={i18n}>
          <StrictMode>
            <HydratedRouter />
          </StrictMode>
        </I18nextProvider>,
      );

      queueMicrotask(() => {
        window.__APP_HYDRATED__ = true;
      });
    });
  } catch (error) {
    console.error(error);
  }
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback: https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
