import { DocumentTextIcon, EllipsisHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useFetcher, useNavigate } from 'react-router';
import type { loader as AutocompleteLoader } from '../autocomplete.ts';
import { CommandPalette, type CommandPaletteItemData } from './command-palette/command-palette.tsx';

type Props = { team: string; event: string; closeText: string; onClose: VoidFunction };

export function EventCommandPalette({ team, event, closeText, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetcher = useFetcher<typeof AutocompleteLoader>();

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const items = useMemo<CommandPaletteItemData[]>(() => {
    const proposals: CommandPaletteItemData[] =
      fetcher.data
        ?.filter((item) => item.section === 'proposals')
        .map((item) => ({ ...item, icon: DocumentTextIcon })) ?? [];

    if (proposals.length === 3) {
      proposals.push({
        section: 'proposals',
        id: 'search-more-proposals',
        title: (query: string) => `More proposals for "${query}"`,
        icon: EllipsisHorizontalIcon,
      });
    }

    const speakers: CommandPaletteItemData[] =
      fetcher.data?.filter((item) => item.section === 'speakers').map((item) => ({ ...item, icon: UserIcon })) ?? [];

    if (speakers.length === 3) {
      speakers.push({
        section: 'speakers',
        id: 'search-more-speakers',
        title: (query: string) => `More speakers for "${query}"`,
        icon: EllipsisHorizontalIcon,
      });
    }

    return [...proposals, ...speakers];
  }, [fetcher.data]);

  const onSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('type', 'proposals');
    searchParams.append('type', 'speakers');

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    return fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
  };

  const handleClick = (item: CommandPaletteItemData, query?: string) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);

    switch (item.section) {
      case 'proposals': {
        if (item.id === 'search-more-proposals') {
          navigate(`${href('/team/:team/:event/reviews', { team, event })}?${searchParams.toString()}`);
        } else if (item.id !== 'search-more-proposals') {
          navigate(href('/team/:team/:event/reviews/:proposal', { team, event, proposal: item.id }));
        }
        break;
      }
      case 'speakers': {
        if (item.id === 'search-more-speakers') {
          navigate(`${href('/team/:team/:event/speakers', { team, event })}?${searchParams.toString()}`);
        } else if (item.id !== 'search-more-proposals') {
          navigate(href('/team/:team/:event/speakers/:speaker', { team, event, speaker: item.id }));
        }
        break;
      }
    }
  };

  return (
    <CommandPalette
      title={t('event-management.command-palette.event.title')}
      description={t('event-management.command-palette.event.description')}
      items={items}
      loading={loading}
      onSearch={onSearch}
      onClick={handleClick}
      onClose={onClose}
      closeText={closeText}
    />
  );
}
