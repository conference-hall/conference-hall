import { ComboboxOption } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Avatar } from '~/design-system/avatar.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import type { CommandPaletteItemData } from './command-palette.tsx';

export function CommandPaletteItem({ item }: { item: CommandPaletteItemData }) {
  return (
    <ComboboxOption
      key={item.id}
      value={item}
      className="group flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none rounded-lg hover:bg-gray-50 data-focus:bg-gray-100"
    >
      {item.icon ? <ItemIcon icon={item.icon} /> : <Avatar picture={item.picture} name={item.title} size="s" />}

      <div className="flex-auto min-w-0">
        <Text size="s" weight="semibold" truncate>
          {item.title}
        </Text>
        <Subtitle size="xs" truncate>
          {item.description}
        </Subtitle>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-data-focus:text-gray-600" />
    </ComboboxOption>
  );
}

function ItemIcon({ icon: IconComponent }: { icon: React.ComponentType<any> }) {
  return (
    <div className="flex-none">
      <div className="p-1.5 rounded-lg bg-gray-100 group-data-focus:bg-white group-data-focus:shadow-sm">
        <IconComponent className="h-4 w-4 text-gray-500 group-data-focus:text-indigo-600" />
      </div>
    </div>
  );
}
