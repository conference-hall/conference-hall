import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { href, useFetcher } from 'react-router';
import { SelectPanel } from '~/design-system/forms/select-panel.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';

type Speaker = { id: string; name: string };

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
  const [selectedSpeakers, setSelectedSpeakers] = useState<Speaker[]>(defaultValue);

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const searchOptions = useMemo(() => {
    return (
      fetcher.data?.map((item) => ({
        value: item.id,
        label: item.title,
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

  const handleChange = (selectedValues: string | string[]) => {
    const allOptions = [...selectedSpeakers.map((s) => ({ value: s.id, label: s.name })), ...searchOptions];
    const selected = allOptions.filter((option) => selectedValues.includes(option.value));
    const speakers = selected.map((option) => ({ id: option.value, name: option.label }));
    setSelectedSpeakers(speakers);
    onChange(speakers);
  };

  // Combine selected speakers with search options, avoiding duplicates
  const availableOptions = useMemo(() => {
    const selectedOptions = selectedSpeakers.map((s) => ({ value: s.id, label: s.name }));
    const filteredSearchOptions = searchOptions.filter(
      (option) => !selectedSpeakers.find((speaker) => speaker.id === option.value),
    );
    return [...selectedOptions, ...filteredSearchOptions];
  }, [searchOptions, selectedSpeakers]);

  return (
    <SelectPanel
      name={name}
      form={form}
      label="Speakers"
      defaultValue={selectedSpeakers.map((s) => s.id)}
      loading={loading}
      options={availableOptions}
      onChange={handleChange}
      onSearch={handleSearch}
    >
      <div className="flex items-center justify-between group">
        <H2 size="s" className="group-hover:text-indigo-600">
          Speakers
        </H2>
        <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
      </div>
    </SelectPanel>
  );
}
