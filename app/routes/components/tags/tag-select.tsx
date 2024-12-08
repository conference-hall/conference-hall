import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Input } from '~/design-system/forms/input.tsx';
import { CheckMicroIcon } from '~/design-system/icons/check-micro-icon.tsx';
import { PencilSquareMicroIcon } from '~/design-system/icons/pencil-square-micro-icon.tsx';
import { XMarkMicroIcon } from '~/design-system/icons/x-mark-micro-icon.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { Tag } from '~/types/tags.types.ts';

export type TagSelectorProps = {
  tags: Array<Tag>;
  defaultValues: Array<Tag>;
  onChange: (tags: Array<Tag>) => void;
  canEditEventTags: boolean;
  children: React.ReactNode;
};

export function TagSelect({ tags, defaultValues = [], onChange, canEditEventTags, children }: TagSelectorProps) {
  const sortedTags = [...tags].sort((a, b) => {
    if (defaultValues.some((tag) => tag.id === b.id)) return 1;
    if (defaultValues.some((tag) => tag.id === a.id)) return -1;
    return 0;
  });

  const [selectedTags, setSelectedTags] = useState(defaultValues);

  const handleChange = () => {
    const selectedTagIds = selectedTags.map((tag) => tag.id);
    if (selectedTags.length === defaultValues.length && defaultValues.every((tag) => selectedTagIds.includes(tag.id))) {
      return;
    }
    onChange(selectedTags);
  };

  return (
    <Listbox value={selectedTags} onChange={setSelectedTags} multiple>
      {({ open }) => (
        <TagsListbox tags={sortedTags} canEditEventTags={canEditEventTags} open={open} onClose={handleChange}>
          {children}
        </TagsListbox>
      )}
    </Listbox>
  );
}

type TagsListboxProps = {
  tags: Array<Tag>;
  canEditEventTags: boolean;
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
};

function TagsListbox({ tags, canEditEventTags, children, open, onClose }: TagsListboxProps) {
  const [filter, setFilter] = useState('');
  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(filter?.toLowerCase()));

  const openStateRef = useRef(false);

  useEffect(() => {
    if (open !== openStateRef.current) {
      openStateRef.current = open;
      if (!open) {
        onClose?.();
        setFilter('');
      }
    }
  }, [open, onClose]);

  return (
    <>
      <ListboxButton>{children}</ListboxButton>

      <ListboxOptions
        anchor="bottom end"
        className="bg-white rounded shadow-md border border-gray-200 divide-y divide-gray-200 w-80 [--anchor-gap:8px]"
        modal={false}
      >
        <Text weight="medium" className="px-4 py-2">
          Apply tags to this proposal
        </Text>

        <Input
          type="search"
          name="query"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter tags"
          placeholder="Filter tags"
          className="p-2"
        />

        <div className="max-h-64 overflow-y-auto">
          {filteredTags.map((tag) => (
            <ListboxOption
              key={tag.id}
              value={tag}
              className="px-4 py-2 cursor-pointer flex justify-between gap-2 data-[focus]:bg-gray-100"
            >
              {({ selected }) => (
                <>
                  <div className="flex justify-between gap-2 truncate">
                    {selected ? <CheckMicroIcon /> : null}
                    <div
                      className={cx('size-4 shrink-0 rounded-full', { 'ml-6': !selected })}
                      style={{ backgroundColor: tag.color }}
                    />
                    <Text size="xs" truncate>
                      {tag.name}
                    </Text>
                  </div>
                  {selected ? <XMarkMicroIcon className="text-gray-400" /> : null}
                </>
              )}
            </ListboxOption>
          ))}

          {filteredTags.length === 0 ? (
            <Text size="xs" variant="secondary" className="px-4 py-2">
              No tags found
            </Text>
          ) : null}
        </div>

        {canEditEventTags ? (
          <Link
            to="../../settings/tags"
            relative="path"
            className="text-xs flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
          >
            <PencilSquareMicroIcon className="text-gray-400" />
            Manage tags
          </Link>
        ) : null}
      </ListboxOptions>
    </>
  );
}
