import * as ReactDOMClient from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';

if (process.env.NODE_ENV === "test") {
  // Bug in Cypress with hydation of the DOM: https://github.com/remix-run/remix/issues/2570
  require("react-dom").hydrate(<RemixBrowser />, document);
} else {
  ReactDOMClient.hydrateRoot(document, <RemixBrowser />);
}
