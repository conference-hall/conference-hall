import { ArrowRightIcon, CheckIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';

import { Statistic } from './statistic';

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
          <ButtonLink to={to} iconRight={ArrowRightIcon}>
            Publish results
          </ButtonLink>
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
