import { createContext, useContext } from 'react';

/**
 * Context containing a server-side nonce for CSP purposes.
 *
 * **_Only provide a value on the server (in entry.server.tsx)! We don't want this ending up in
 * client bundles._**
 *
 * On the client this should just return an empty string.
 */
export const Nonce = createContext('');

/**
 * Get a "nonce", which is a random string generated for each HTTP request.
 *
 * This app's CSP directives are configured to recognize it. Pass to any `<script>` tags so that
 * browsers know they are trused.
 *
 * @see https://content-security-policy.com/nonce/
 *
 * @example
 * const nonce = useNonce();
 *
 * <div>
 *   <script src="./some-src.js" nonce={nonce} />
 * </div>
 */
export function useNonce() {
  return useContext(Nonce);
}
