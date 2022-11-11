import { URL } from 'node:url';
import { vi } from 'vitest';
import { installGlobals } from '@remix-run/node';

// Fix: happy-dom has a bug when parsing URL
// See https://github.com/capricorn86/happy-dom/issues/569
// @ts-ignore
globalThis.URL = URL;

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals();

global.console.info = vi.fn();
