import { DocumentTextIcon, EllipsisHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useFetcher, useNavigate } from 'react-router';
import type { loader as AutocompleteLoader } from '../autocomplete.ts';
import { CommandPalette, type CommandPaletteItemData } from './command-palette/command-palette.tsx';

type Props = { team: string; event: string; closeText: string; onClose: VoidFunction };

const PROPOSALS_KIND = 'proposals';
const SPEAKERS_KIND = 'speakers';

export function EventCommandPalette({ team, event, closeText, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetcher = useFetcher<typeof AutocompleteLoader>();

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const items = useMemo<CommandPaletteItemData[]>(() => {
    const proposals: CommandPaletteItemData[] =
      fetcher.data
        ?.filter((item) => item.kind === PROPOSALS_KIND)
        .map((item) => ({ ...item, section: t('common.proposals'), icon: DocumentTextIcon })) ?? [];

    if (proposals.length === 3) {
      proposals.push({
        section: t('common.proposals'),
        id: 'search-more-proposals',
        label: (query: string) => t('event-management.command-palette.event.more.proposals', { query }),
        icon: EllipsisHorizontalIcon,
      });
    }

    const speakers: CommandPaletteItemData[] =
      fetcher.data
        ?.filter((item) => item.kind === SPEAKERS_KIND)
        .map((item) => ({ ...item, section: t('common.speakers'), icon: UserIcon })) ?? [];

    if (speakers.length === 3) {
      speakers.push({
        section: t('common.speakers'),
        id: 'search-more-speakers',
        label: (query: string) => t('event-management.command-palette.event.more.speakers', { query }),
        icon: EllipsisHorizontalIcon,
      });
    }

    return [...proposals, ...speakers];
  }, [fetcher.data, t]);

  const onSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('kind', PROPOSALS_KIND);
    searchParams.append('kind', SPEAKERS_KIND);

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    return fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
  };

  const handleClick = (item: CommandPaletteItemData, query?: string) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);

    switch (item.section) {
      case t('common.proposals'): {
        if (item.id === 'search-more-proposals') {
          navigate(`${href('/team/:team/:event/proposals', { team, event })}?${searchParams.toString()}`);
        } else {
          navigate(href('/team/:team/:event/proposals/:proposal', { team, event, proposal: item.id }));
        }
        break;
      }
      case t('common.speakers'): {
        if (item.id === 'search-more-speakers') {
          navigate(`${href('/team/:team/:event/speakers', { team, event })}?${searchParams.toString()}`);
        } else {
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
