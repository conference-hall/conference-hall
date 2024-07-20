import type { ReactNode } from 'react';

import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { H1, Subtitle } from '~/design-system/typography.tsx';

import { Footer } from './footer.tsx';

type Props = { title: string; subtitle: string; withFooter?: boolean; children?: ReactNode };

export function SinglePage({ title, subtitle, withFooter = false, children }: Props) {
  return (
    <div className="flex flex-col items-center h-screen w-screen gap-24">
      <div className="flex flex-col items-center justify-center gap-2 pt-32">
        <ConferenceHallLogo width="32px" height="32px" aria-hidden className="fill-slate-300" />

        <H1 size="xl" weight="bold">
          Conference Hall
        </H1>
      </div>

      <div className="flex flex-col grow items-center gap-4 px-8 text-center">
        <H1 size="3xl" weight="bold">
          {title}
        </H1>

        <Subtitle>{subtitle}</Subtitle>

        {children}
      </div>

      {withFooter ? <Footer /> : null}
    </div>
  );
}
