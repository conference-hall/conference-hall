import type { ReactNode } from 'react';

import { ConferenceHallLogo } from '~/design-system/logo.tsx';

import { Footer } from './footer.tsx';
import { Navbar } from './navbar/navbar.tsx';
import { useUser } from './use-user.tsx';

type Props = { children: ReactNode };

export function FullscreenPage({ children }: Props) {
  const { user } = useUser();

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 h-screen w-screen overflow-hidden">
      <Navbar user={user} variant="secondary" className="bg-transparent absolute inset-x-0 z-30" />

      {/* Main panel */}
      <div className="flex flex-col space-between col-span-2 h-screen w-full pt-24 md:pt-36 px-8 md:px-16 lg:px-32">
        <main className="space-y-8 md:space-y-16 grow overflow-auto">{children}</main>

        <Footer />
      </div>

      {/* Right panel */}
      <div className="bg-gradient-to-b from-gray-800 to-slate-700 h-screen hidden lg:block pt-16 text-white relative">
        <div className="flex flex-row justify-center items-end h-full">
          <ConferenceHallLogo className="-mr-60 -mb-16 -rotate-12 text-black opacity-10" width="480px" height="480px" />
        </div>
      </div>
    </div>
  );
}
