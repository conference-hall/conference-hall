import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { HydratedRouter } from 'react-router/dom';
import { initializeI18n } from './libs/i18n/i18n.browser.ts';

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
});
