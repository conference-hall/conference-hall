import { cx } from 'class-variance-authority';

import { Divider } from '../divider.tsx';
import { Card } from '../layouts/card.tsx';
import { Link } from '../links.tsx';
import { Text } from '../typography.tsx';

type Props = { label: string; stat: string; to?: string };

export function StatCard({ label, stat, to }: Props) {
  return (
    <Card className="flex flex-col">
      <div className={cx('flex flex-col grow', { 'px-6 py-4': to, 'p-6': !to })}>
        <Text variant="secondary">{label}</Text>
        <p className="text-3xl font-semibold mt-2">{stat}</p>
      </div>

      {to && (
        <>
          <Divider />

          <div className="flex flex-row items-center justify-end p-3">
            <Link to="/" className="font-medium">
              View more →
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
