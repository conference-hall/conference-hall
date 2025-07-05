import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form, useSearchParams } from 'react-router';
import type { SearchFilters } from '~/.server/event-search/event-search.types.ts';
import { Input } from '~/shared/design-system/forms/input.tsx';

type Props = { filters: SearchFilters };

export function SearchEventsInput({ filters }: Props) {
  const { query, type } = filters;
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const talkId = searchParams.get('talkId');

  return (
    <Form action="/" method="GET" className="w-full">
      {type && <input type="hidden" name="type" value={type} />}
      {talkId && <input type="hidden" name="talkId" value={talkId} />}

      <Input
        name="query"
        type="search"
        aria-label={t('home.search.label')}
        placeholder={t('home.search.placeholder')}
        icon={MagnifyingGlassIcon}
        color="dark"
        size="l"
        defaultValue={query}
        className="w-full"
        min={3}
      />
    </Form>
  );
}
