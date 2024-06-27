import { ArrowRightIcon } from '@heroicons/react/20/solid';
import slugify from '@sindresorhus/slugify';

import { Divider } from '~/design-system/divider.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { label: string; stat: string; to?: string };

export function StatisticCard({ label, stat, to }: Props) {
  const id = slugify(label);

  return (
    <Card className="flex flex-col" aria-labelledby={id}>
      <div className="flex flex-col grow px-6 py-4">
        <Text id={id} variant="secondary">
          {label}
        </Text>
        <p className="text-3xl font-semibold mt-2">{stat}</p>
      </div>

      {to && (
        <>
          <Divider />

          <div className="flex flex-row items-center justify-end p-3">
            <Link to="/" iconRight={ArrowRightIcon} weight="medium">
              View more
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
