import { PlusIcon } from '@heroicons/react/16/solid';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { href, useFetcher } from 'react-router';
import { SelectPanel, type SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { H2 } from '~/design-system/typography.tsx';
import type { loader as AutocompleteLoader } from '../../../command-palette/autocomplete.ts';

type Props = {
  team: string;
  event: string;
  form: string;
  onChange: (speaker: Array<{ id: string; name: string }>) => void;
};

export function SpeakersSelectPanel({ team, event, form, onChange }: Props) {
  const fetcher = useFetcher<typeof AutocompleteLoader>();

  const loading = ['loading', 'submitting'].includes(fetcher.state);

  const [query, setQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<SelectPanelOption[]>([]);

  const options = useMemo(() => {
    const searchOptions =
      fetcher.data?.map((item) => ({
        value: item.id,
        label: item.title,
      })) ?? [];

    const filteredSearchOptions = searchOptions.filter(
      (option) => !selectedOptions.find((o) => o.value === option.value),
    );

    return [...selectedOptions, ...filteredSearchOptions];
  }, [fetcher.data, selectedOptions]);

  const handleSearch = (query: string) => {
    setQuery(query);

    const searchParams = new URLSearchParams();
    searchParams.append('query', query);
    searchParams.append('type', 'speakers');

    const autocompleteRoute = href('/team/:team/:event/autocomplete', { team, event });
    return fetcher.load(`${autocompleteRoute}?${searchParams.toString()}`);
  };

  const handleChange = (selectedValues: string | string[]) => {
    const selected = options.filter((option) => selectedValues.includes(option.value));
    setSelectedOptions(selected);
    onChange(selected.map((option) => ({ id: option.value, name: option.label })));
  };

  return (
    <SelectPanel
      name="speakers"
      label="Speakers"
      form={form}
      options={options}
      defaultValue={[]}
      onChange={handleChange}
      onSearch={handleSearch}
      loading={loading}
      footer={<CreateSpeakerButton query={query} />}
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

type CreateSpeakerButtonProps = { query: string };

function CreateSpeakerButton({ query }: CreateSpeakerButtonProps) {
  return (
    <button type="button" onClick={console.log} className={cx('text-xs hover:bg-gray-100', menuItem())}>
      <PlusIcon className="text-gray-400 h-5 w-5" aria-hidden />
      {query ? `Create speaker "${query}"` : 'Create speaker'}
    </button>
  );
}
