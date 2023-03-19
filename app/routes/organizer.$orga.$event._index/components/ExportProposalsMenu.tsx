import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useParams, useSearchParams } from '@remix-run/react';
import type { ButtonStylesProps } from '~/design-system/Buttons';
import { getStyles } from '~/design-system/Buttons';
import { MenuTransition } from '~/design-system/Transitions';

type Props = { selection: Array<string>; total: number } & ButtonStylesProps;

export function ExportProposalsStatus({ selection, total, ...rest }: Props) {
  const styles = getStyles(rest);
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <Menu as="div" className="relative z-20 inline-block text-left">
      <Menu.Button className={styles}>
        Export...
        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <MenuTransition>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            <a
              href={`/export/proposals/json?orga=${params.orga}&event=${params.event}&${searchParams.toString()}`}
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center px-4 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
            >
              As JSON
            </a>
          </Menu.Item>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}
