import { ComboboxOption } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Avatar } from '~/design-system/avatar.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import type { CommandPaletteItemData } from './command-palette.tsx';

type Props = { item: CommandPaletteItemData; query: string };

export function CommandPaletteItem({ item, query }: Props) {
  const title = typeof item.label === 'function' ? item.label(query) : item.label;

  return (
    <ComboboxOption
      key={item.id}
      value={item}
      className="group flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 data-focus:bg-gray-100"
    >
      {item.picture ? <Avatar picture={item.picture} name={title} size="s" /> : <ItemIcon icon={item.icon} />}

      <div className="min-w-0 flex-auto">
        <Text size="s" weight="semibold" truncate>
          {title}
        </Text>
        <Subtitle size="xs" truncate>
          {item.description}
        </Subtitle>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-data-focus:text-gray-600" />
    </ComboboxOption>
  );
}

function ItemIcon({ icon: IconComponent }: { icon?: React.ComponentType<any> }) {
  if (!IconComponent) return null;

  return (
    <div className="flex-none">
      <div className="rounded-lg bg-gray-100 p-1.5 group-data-focus:bg-white group-data-focus:shadow-sm">
        <IconComponent className="h-4 w-4 text-gray-500 group-data-focus:text-indigo-600" aria-hidden />
      </div>
    </div>
  );
}
