import { installGlobals } from '@remix-run/node';
import { vi } from 'vitest';

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals();

global.console.info = vi.fn();
