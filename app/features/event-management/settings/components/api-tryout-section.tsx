import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '~/design-system/forms/input.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

type Props = { slug: string; apiKey: string };

export function EventProposalApiTryout({ slug, apiKey }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const params = new URLSearchParams();
  params.set('key', apiKey);
  if (query) params.set('query', query);
  if (status) params.set('status', status);

  const url = `/api/v1/event/${slug}?${params.toString()}`;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.web-api.tryout.proposals.heading')}</H2>
        <Subtitle>{t('event-management.settings.web-api.tryout.proposals.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <code className="rounded-sm bg-gray-100 p-4 text-sm">{url}</code>
        <Input
          name="query"
          label={t('event-management.settings.web-api.tryout.proposals.query.label')}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('event-management.settings.web-api.tryout.proposals.query.placeholder')}
        />
        <Select
          name="deliberationStatus"
          label={t('event-management.settings.web-api.tryout.proposals.status.label')}
          options={[
            { value: '', name: t('common.all') },
            { value: 'pending', name: t('common.proposals.status.pending') },
            { value: 'accepted', name: t('common.proposals.status.accepted') },
            { value: 'rejected', name: t('common.proposals.status.rejected') },
          ]}
          defaultValue={status}
          onChange={(_name, value) => setStatus(value)}
        />
      </Card.Content>

      <Card.Actions>
        <ExternalLink href={url} target="_blank" iconRight={ArrowRightIcon} weight="medium">
          {t('common.try-out')}
        </ExternalLink>
      </Card.Actions>
    </Card>
  );
}

export function EventScheduleApiTryout({ slug, apiKey }: Props) {
  const { t } = useTranslation();
  const params = new URLSearchParams();
  params.set('key', apiKey);

  const url = `/api/v1/event/${slug}/schedule?${params.toString()}`;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.web-api.tryout.schedule.heading')}</H2>
        <Subtitle>{t('event-management.settings.web-api.tryout.schedule.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <code className="rounded-sm bg-gray-100 p-4 text-sm">{url}</code>
      </Card.Content>

      <Card.Actions>
        <ExternalLink href={url} target="_blank" iconRight={ArrowRightIcon} weight="medium">
          {t('common.try-out')}
        </ExternalLink>
      </Card.Actions>
    </Card>
  );
}
