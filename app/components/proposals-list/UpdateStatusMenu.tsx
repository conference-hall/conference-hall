import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import type { ButtonStylesProps } from '~/design-system/Buttons';
import { getStyles } from '~/design-system/Buttons';
import { MenuTransition } from '~/design-system/Transitions';

export const UPDATE_PROPOSAL_STATUS_ACTION = 'update-proposal-status';

type Props = { selection: Array<string> } & ButtonStylesProps;

export function UpdateStatusMenu({ selection, ...rest }: Props) {
  const disabled = selection.length === 0;
  const styles = getStyles({ disabled, ...rest });

  return (
    <Menu as="div" className="relative z-20 inline-block text-left">
      <Menu.Button className={styles} disabled={disabled}>
        Mark as...
        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
      </Menu.Button>
      <MenuTransition>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            <Form method="post">
              <input type="hidden" name="_action" value={UPDATE_PROPOSAL_STATUS_ACTION} />
              <input type="hidden" name="status" value="ACCEPTED" />
              {selection.map((id) => (
                <input key={id} type="hidden" name="selection" value={id} />
              ))}
              <button
                type="submit"
                className="flex w-full items-center px-4 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
              >
                Accepted proposal(s)
              </button>
            </Form>
          </Menu.Item>
          <Menu.Item>
            <Form method="post">
              <input type="hidden" name="_action" value={UPDATE_PROPOSAL_STATUS_ACTION} />
              <input type="hidden" name="status" value="REJECTED" />
              {selection.map((id) => (
                <input key={id} type="hidden" name="selection" value={id} />
              ))}
              <button
                type="submit"
                className="flex w-full items-center px-4 py-3 text-sm hover:bg-gray-100 hover:text-gray-900"
              >
                Rejected proposal(s)
              </button>
            </Form>
          </Menu.Item>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}
