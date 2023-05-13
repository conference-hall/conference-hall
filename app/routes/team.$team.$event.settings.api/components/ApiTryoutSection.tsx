import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Input } from '~/design-system/forms/Input';
import Select from '~/design-system/forms/Select';
import { Card } from '~/design-system/layouts/Card';
import { ExternalLink } from '~/design-system/Links';
import { H2, Subtitle } from '~/design-system/Typography';

type Props = { slug: string; apiKey: string };

export function ApiTryoutSection({ slug, apiKey }: Props) {
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
        <H2 size="base">Event proposals API</H2>
        <Subtitle>List event proposals, you can filters them around different criterias.</Subtitle>
      </Card.Title>

      <Card.Content>
        <code className="rounded bg-gray-100 p-4 text-sm">{url}</code>
        <Input
          name="query"
          label="query"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by term in proposal titles or speaker names"
        />
        <Select
          name="status"
          label="status"
          options={[
            { id: '', label: 'All (by default)' },
            { id: 'SUBMITTED', label: 'Submitted' },
            { id: 'ACCEPTED', label: 'Accepted by organizers' },
            { id: 'REJECTED', label: 'Rejected by organizers' },
            { id: 'CONFIRMED', label: 'Confirmed by speaker' },
            { id: 'DECLINED', label: 'Declined by speaker' },
          ]}
          value={status}
          onChange={(name, value) => setStatus(value)}
        />
      </Card.Content>

      <Card.Actions>
        <ExternalLink href={url} target="_blank" icon={ArrowRightIcon} className="font-semibold">
          Try out
        </ExternalLink>
      </Card.Actions>
    </Card>
  );
}
