import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Input } from '~/design-system/forms/input.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { ExternalLink } from '~/design-system/links.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

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
        <H2>Event proposals API</H2>
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
          name="deliberationStatus"
          label="deliberationStatus"
          options={[
            { id: '', name: 'All (by default)' },
            { id: 'pending', name: 'Not deliberated' },
            { id: 'accepted', name: 'Accepted' },
            { id: 'rejected', name: 'Rejected' },
          ]}
          defaultValue={status}
          onChange={(_name, value) => setStatus(value)}
        />
      </Card.Content>

      <Card.Actions>
        <ExternalLink href={url} target="_blank" iconRight={ArrowRightIcon} weight="medium">
          Try out
        </ExternalLink>
      </Card.Actions>
    </Card>
  );
}
