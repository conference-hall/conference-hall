import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import type { ButtonStylesProps } from '~/design-system/Buttons';
import { getStyles } from '~/design-system/Buttons';

export const EXPORT_SELECTED_ACTION = 'export-selected';
export const EXPORT_ALL_ACTION = 'export-all';

type Props = { selection: Array<string> } & ButtonStylesProps;

export function ExportProposalsStatus({ selection, ...rest }: Props) {
  const styles = getStyles(rest);

  return (
    <Menu as="div" className="relative z-20 inline-block text-left">
      <Menu.Button className={styles}>
        Export...
        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {selection.length > 0 && (
            <Menu.Item>
              <Form method="post">
                <input type="hidden" name="_action" value={EXPORT_SELECTED_ACTION} />
                {selection.map((id) => (
                  <input key={id} type="hidden" name="selection[]" value={id} />
                ))}
                <button
                  type="submit"
                  className="flex w-full items-center px-4 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
                >
                  {`${selection.length} selected proposals`}
                </button>
              </Form>
            </Menu.Item>
          )}
          <Menu.Item>
            <Form method="post">
              <input type="hidden" name="_action" value={EXPORT_ALL_ACTION} />
              <button
                type="submit"
                className="group flex w-full items-center px-4 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
              >
                All proposals
              </button>
            </Form>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
