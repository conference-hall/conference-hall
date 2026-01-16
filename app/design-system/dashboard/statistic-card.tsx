import { cx } from 'class-variance-authority';
import { type ReactNode, useId } from 'react';
import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { label: string; stat: string | number | ReactNode; children?: ReactNode };

export function StatisticCard({ label, stat, children }: Props) {
  const id = useId();

  return (
    <Card className="flex flex-col" aria-labelledby={id}>
      <div className="flex flex-1 grow flex-col gap-0.5 p-6">
        <Text id={id} variant="secondary">
          {label}
        </Text>
        <div className="text-3xl font-semibold">{stat}</div>
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
      <div className="flex flex-row items-center justify-end px-4 py-3">{children}</div>
    </>
  );
}

StatisticCard.Footer = Footer;
