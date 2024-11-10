import type { SerializeFrom } from '@remix-run/node';
import { type ReactNode, createContext, useContext } from 'react';
import type { loader } from '~/root.tsx';

type User = SerializeFrom<typeof loader>['user'];

const UserContext = createContext<User | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  user: User;
};

export const UserProvider = ({ children, user }: UserProviderProps) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export function useUser(): User {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
