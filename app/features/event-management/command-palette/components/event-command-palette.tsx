import { DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
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

  // todo(autocomplete): add "more results" for section
  const items = useMemo<CommandPaletteItemData[]>(() => {
    return (
      fetcher.data?.map((item) => ({
        ...item,
        icon: item.section === 'proposals' ? DocumentTextIcon : UserIcon,
      })) ?? []
    );
  }, [fetcher.data]);

  const onSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('type', 'proposals');
    searchParams.append('type', 'speakers');

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    return fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
  };

  const handleClick = (item: CommandPaletteItemData) => {
    switch (item.section) {
      case 'proposals': {
        navigate(href('/team/:team/:event/reviews/:proposal', { team, event, proposal: item.id }));
        break;
      }
      case 'speakers': {
        navigate(href('/team/:team/:event/speakers/:speaker', { team, event, speaker: item.id }));
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
