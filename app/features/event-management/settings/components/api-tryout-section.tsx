import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeBlock } from '~/design-system/code-block.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

type Props = { slug: string; apiKey: string; appUrl: string };

export function EventProposalApiTryout({ slug, apiKey, appUrl }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const url = new URL(`/api/v1/event/${slug}`, appUrl);
  if (query) url.searchParams.set('query', query);
  if (status) url.searchParams.set('status', status);

  const curlCommand = `curl -H "X-API-Key: ${apiKey}" "${url.toString()}"`;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.web-api.tryout.proposals.heading')}</H2>
        <Subtitle>{t('event-management.settings.web-api.tryout.proposals.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
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
        <CodeBlock code={curlCommand} label={t('event-management.settings.web-api.tryout.curl')} />
      </Card.Content>
    </Card>
  );
}

export function EventScheduleApiTryout({ slug, apiKey, appUrl }: Props) {
  const { t } = useTranslation();

  const url = new URL(`/api/v1/event/${slug}/schedule`, appUrl);
  const curlCommand = `curl -H "X-API-Key: ${apiKey}" "${url.toString()}"`;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.web-api.tryout.schedule.heading')}</H2>
        <Subtitle>{t('event-management.settings.web-api.tryout.schedule.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <CodeBlock code={curlCommand} label={t('event-management.settings.web-api.tryout.curl')} />
      </Card.Content>
    </Card>
  );
}
