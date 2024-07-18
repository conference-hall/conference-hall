import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';

import { Footer } from './footer.tsx';
import type { NavbarLayout } from './navbar/navbar.tsx';
import { Navbar } from './navbar/navbar.tsx';
import { useUser } from './use-user.tsx';

type Props = { children: ReactNode; navbar: NavbarLayout; compact?: boolean; className?: string };

export function FullscreenPage({ children, navbar, compact, className }: Props) {
  const { user } = useUser();

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 h-screen w-screen overflow-hidden">
      <Navbar layout={navbar} user={user} variant="secondary" className="bg-transparent absolute inset-x-0 z-30" />

      {/* Main panel */}
      <div
        className={cx('flex flex-col space-between col-span-2 h-screen w-full px-8 md:px-16 lg:px-32 overflow-auto', {
          'pt-24 md:pt-36': !compact,
          'pt-24': compact,
        })}
      >
        <main
          className={cx('grow max-w-4xl', { 'space-y-8 md:space-y-16': !compact, 'space-y-8': compact }, className)}
        >
          {children}
        </main>

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

type FullscreenPageTitle = { title: string; subtitle?: string };

function Title({ title, subtitle }: FullscreenPageTitle) {
  return (
    <div className="space-y-6">
      <H1 size="3xl" weight="bold">
        {title}
      </H1>
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
    </div>
  );
}

FullscreenPage.Title = Title;
