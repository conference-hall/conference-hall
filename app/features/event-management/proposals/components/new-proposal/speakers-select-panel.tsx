import { PlusIcon } from '@heroicons/react/16/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { href, useFetcher } from 'react-router';
import { SelectPanel, type SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { H2 } from '~/design-system/typography.tsx';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';

type Speaker = { id: string; name: string; picture?: string | null };

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
        picture: item.picture,
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

  const handleChange = (selectedOptions: SelectPanelOption[]) => {
    const speakers = selectedOptions.map((option) => ({
      id: option.value,
      name: option.label,
      picture: option.picture,
    }));

    setSelectedSpeakers(speakers);
    onChange(speakers);
  };

  const availableOptions = useMemo(() => {
    const searchOptionsMap = new Map(searchOptions.map((option) => [option.value, option]));
    const options = [...searchOptions];
    selectedSpeakers.forEach((speaker) => {
      if (!searchOptionsMap.has(speaker.id)) {
        options.push({ value: speaker.id, label: speaker.name, picture: speaker.picture });
      }
    });

    return options;
  }, [searchOptions, selectedSpeakers]);

  return (
    <SelectPanel
      name={name}
      form={form}
      label="Speakers"
      defaultValue={selectedSpeakers.map((speaker) => speaker.id)}
      loading={loading}
      options={availableOptions}
      onChange={handleChange}
      onSearch={handleSearch}
      footer={<CreateSpeakerButton />}
      displayPicture
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
      <PlusIcon className="h-5 w-5 text-gray-400" aria-hidden />
      Create speaker
    </button>
  );
}
