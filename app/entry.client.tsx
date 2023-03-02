import * as ReactDOMClient from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';

ReactDOMClient.hydrateRoot(document, <RemixBrowser />);
