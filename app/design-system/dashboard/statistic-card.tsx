import { cx } from 'class-variance-authority';
import { type ReactNode, useId } from 'react';

import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { label: string; stat: string | number; children?: ReactNode };

export function StatisticCard({ label, stat, children }: Props) {
  const id = useId();

  return (
    <Card className="flex flex-col" aria-labelledby={id}>
      <div className="flex flex-col gap-0.5 grow p-6 flex-1">
        <Text id={id} variant="secondary">
          {label}
        </Text>
        <p className="text-3xl font-semibold">{stat}</p>
      </div>
      {children}
    </Card>
  );
}

function Content({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('grow px-6 pb-6', className)}>{children}</div>;
}

StatisticCard.Content = Content;

function Footer({ children }: { children: ReactNode }) {
  return (
    <>
      <Divider />
      <div className="flex flex-row items-center justify-end py-3 px-4">{children}</div>
    </>
  );
}

StatisticCard.Footer = Footer;
