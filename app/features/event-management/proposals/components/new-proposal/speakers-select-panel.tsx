import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { href, useFetcher } from 'react-router';
import { H2 } from '~/design-system/typography.tsx';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';
import { SelectPanelNew, type SelectPanelNewOption } from './select-panel-new.tsx';

type Speaker = SelectPanelNewOption;

type Props = {
  team: string;
  event: string;
  form: string;
  name?: string;
  defaultValue?: Speaker[];
  onChange: (speakers: Speaker[]) => void;
};

export function SpeakersSelectPanel({ team, event, form, name = 'speakers', defaultValue = [], onChange }: Props) {
  const fetcher = useFetcher<typeof AutocompleteLoader>();

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const searchOptions = useMemo(() => {
    return (
      fetcher.data?.map((item) => ({
        id: item.id,
        name: item.title,
      })) ?? []
    );
  }, [fetcher.data]);

  const handleSearch = async (query: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('kind', 'speakers');

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    await fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
  };

  return (
    <SelectPanelNew
      name={name}
      label="Speakers"
      form={form}
      defaultValue={defaultValue}
      loading={loading}
      options={searchOptions}
      onChange={onChange}
      onSearch={handleSearch}
    >
      <div className="flex items-center justify-between group">
        <H2 size="s" className="group-hover:text-indigo-600">
          Speakers
        </H2>
        <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
      </div>
    </SelectPanelNew>
  );
}
