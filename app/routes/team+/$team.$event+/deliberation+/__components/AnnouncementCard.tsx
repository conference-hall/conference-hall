import { CheckIcon } from '@heroicons/react/20/solid';

import { Card } from '~/design-system/layouts/Card';
import { Link } from '~/design-system/Links';
import { Text } from '~/design-system/Typography';

import { Statistic, type Statistics } from './Statistics';

type AnnouncementCardProps = { id: string; title: string; subtitle: string; statistics: Statistics; to: string };

export function AnnouncementCard({ id, title, subtitle, statistics, to }: AnnouncementCardProps) {
  return (
    <Card data-testid={id} className="basis-1/2">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-2">{title}</h3>
        <div className="flex gap-4">
          <Text variant="secondary">
            {subtitle} You can also notify speakers via email. {statistics.published} proposal(s) results already
            announced.
          </Text>
          <dl className="flex flex-col items-center pl-4 border-l border-l-gray-200">
            {statistics.notPublished !== 0 ? (
              <Statistic name="total-announce-to-publish" label="To publish" value={statistics.notPublished} />
            ) : (
              <Statistic name="total-announce-published" label="Announced" value={statistics.published} />
            )}
          </dl>
        </div>
        {statistics.notPublished > 0 ? (
          <div className="flex mt-4 text-sm leading-6">
            <Link to={to} weight="semibold">
              Publish results
              <span aria-hidden="true">&nbsp;&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center mt-4 text-sm leading-6">
            <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
            <Text weight="semibold">All results published</Text>
          </div>
        )}
      </div>
    </Card>
  );
}
