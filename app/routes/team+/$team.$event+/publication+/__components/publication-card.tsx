import { CheckIcon } from '@heroicons/react/20/solid';

import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { Text } from '~/design-system/typography.tsx';

import { Statistic } from './statistic.tsx';

type Props = {
  id: string;
  title: string;
  subtitle: string;
  statistics: { notPublished: number; published: number };
  to: string;
};

export function PublicationCard({ id, title, subtitle, statistics, to }: Props) {
  return (
    <Card data-testid={id} className="basis-1/2 px-4 py-5 sm:p-6 space-y-2">
      <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
      <div className="flex gap-4">
        <Text variant="secondary">
          {subtitle} You can also notify speakers via email. {statistics.published} proposal(s) results already
          published.
        </Text>
        <dl className="flex flex-col items-center pl-4 border-l border-l-gray-200">
          {statistics.notPublished !== 0 ? (
            <Statistic name="publication-to-publish" label="To publish" value={statistics.notPublished} />
          ) : (
            <Statistic name="publication-published" label="Published" value={statistics.published} />
          )}
        </dl>
      </div>
      {statistics.notPublished > 0 ? (
        <div className="flex">
          <Link to={to} className="font-medium">
            Publish results &rarr;
          </Link>
        </div>
      ) : statistics.published === 0 ? (
        <div className="flex items-center py-2">
          <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
          <Text weight="semibold">Nothing to publish yet</Text>
        </div>
      ) : (
        <div className="flex items-center py-2">
          <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
          <Text weight="semibold">All results published</Text>
        </div>
      )}
    </Card>
  );
}
