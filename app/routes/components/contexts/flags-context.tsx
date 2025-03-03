import { type ReactNode, createContext, useContext } from 'react';
import type { loader } from '~/root.tsx';
import type { SerializeFrom } from '~/types/react-router.types.ts';

type Flags = SerializeFrom<typeof loader>['flags'];

const FlagsContext = createContext<Flags | undefined>(undefined);

type FlagsProviderProps = {
  children: ReactNode;
  flags: Flags;
};

export const FlagsProvider = ({ children, flags }: FlagsProviderProps) => {
  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
};

/**
 * Returns the feature flags
 * @returns {Flags}
 */
export function useFlags(): Flags {
  const context = useContext(FlagsContext);
  if (context === undefined) {
    throw new Error('useFlags must be used within a FlagsProvider');
  }
  return context;
}

/**
 * Returns the flag value for the given key
 * @param key flag key
 * @returns {boolean}
 */
export function useFlag<Key extends keyof Flags>(key: Key): Flags[Key] {
  const flags = useFlags();
  return flags[key];
}
