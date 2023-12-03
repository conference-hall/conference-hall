import { ArrowRightIcon, CheckIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Subtitle, Text } from '~/design-system/Typography';

import { Statistics } from './Statistics';

type AnnouncementCardProps = { title: string; subtitle: string; statistics: Statistics; to: string };

export function AnnouncementCard({ title, subtitle, statistics, to }: AnnouncementCardProps) {
  return (
    <Card as="li" className="basis-1/2">
      <Card.Content>
        <div className="overflow-hidden text-center">
          <Text size="base" weight="semibold" truncate>
            {title}
          </Text>
          <Subtitle truncate>{subtitle}</Subtitle>
        </div>
        <Statistics {...statistics} />
      </Card.Content>
      <Card.Actions align={statistics.notPublished === 0 ? 'center' : 'right'}>
        {statistics.notPublished > 0 ? (
          <ButtonLink to={to} variant="secondary">
            Announce {statistics.notPublished} results
            <ArrowRightIcon className="h-5 w-5 ml-1" aria-hidden="true" />
          </ButtonLink>
        ) : (
          <div className="flex items-center p-2">
            <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
            <Text weight="medium">All results accounced</Text>
          </div>
        )}
      </Card.Actions>
    </Card>
  );
}
