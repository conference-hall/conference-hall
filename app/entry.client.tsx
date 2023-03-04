import * as ReactDOMClient from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';

// if (process.env.NODE_ENV === 'production') {
//   ReactDOMClient.hydrateRoot(document, <RemixBrowser />);
// } else {
// Bug in Cypress with hydration of the DOM: https://github.com/remix-run/remix/issues/2570
require('react-dom').hydrate(<RemixBrowser />, document);
// }
//
