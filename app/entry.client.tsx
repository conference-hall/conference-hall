import * as ReactDOMClient from 'react-dom/client';
import { RemixBrowser } from "remix";

ReactDOMClient.hydrateRoot(document, <RemixBrowser />);
