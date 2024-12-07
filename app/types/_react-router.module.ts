// Declare module for react-router context
declare module 'react-router' {
  interface AppLoadContext {
    cspNonce: string;
  }

  // TODO: remove this once we've migrated to `Route.LoaderArgs` instead for our loaders
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: remove this once we've migrated to `Route.ActionArgs` instead for our actions
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}

export {}; // necessary for TS to treat this as a module
