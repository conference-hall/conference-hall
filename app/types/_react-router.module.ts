// Declare module for react-router context
declare module 'react-router' {
  interface AppLoadContext {
    cspNonce: string;
  }
}

export {}; // necessary for TS to treat this as a module
