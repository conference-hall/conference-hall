import { PlusIcon } from '@heroicons/react/16/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { href, useFetcher } from 'react-router';
import { SelectPanel } from '~/design-system/forms/select-panel.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
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
    const selectedIds = Array.isArray(selectedValues) ? selectedValues : [selectedValues];

    // Create a map of all available options (both selected and search results)
    const allOptionsMap = new Map<string, { value: string; label: string }>();

    // Add current selected speakers
    selectedSpeakers.forEach((s) => {
      allOptionsMap.set(s.id, { value: s.id, label: s.name });
    });

    // Add search results
    searchOptions.forEach((option) => {
      allOptionsMap.set(option.value, option);
    });

    // Filter to only selected IDs and convert to speakers
    const speakers = selectedIds
      .map((id) => allOptionsMap.get(id))
      .filter((option): option is { value: string; label: string } => option !== undefined)
      .map((option) => ({ id: option.value, name: option.label }));

    setSelectedSpeakers(speakers);
    onChange(speakers);
  };

  // Combine all unique options, maintaining search results order
  const availableOptions = useMemo(() => {
    const searchOptionsMap = new Map(searchOptions.map((option) => [option.value, option]));

    // Start with search results to maintain their order
    const options = [...searchOptions];

    // Add any selected speakers that aren't in search results
    selectedSpeakers.forEach((speaker) => {
      if (!searchOptionsMap.has(speaker.id)) {
        options.push({ value: speaker.id, label: speaker.name });
      }
    });

    return options;
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
      footer={<CreateSpeakerButton />}
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

function CreateSpeakerButton() {
  return (
    <button type="button" className={cx('text-s hover:bg-gray-100', menuItem())}>
      <PlusIcon className="h-5 w-5 text-gray-400" />
      Create speaker
    </button>
  );
}
