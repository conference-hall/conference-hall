import type { ReactNode } from 'react';
import { H1, Subtitle } from '~/design-system/typography.tsx';

type Props = { title: string; subtitle: string; children?: ReactNode };

export function ErrorDisplay({ title, subtitle, children }: Props) {
  return (
    <div className="flex w-full flex-col items-center pt-20">
      <div className="flex grow flex-col items-center gap-4 px-8">
        <H1 size="3xl" weight="bold">
          {title}
        </H1>

        <Subtitle>{subtitle}</Subtitle>

        {children}
      </div>
    </div>
  );
}
