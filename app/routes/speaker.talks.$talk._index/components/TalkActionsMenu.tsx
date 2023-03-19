import { Menu } from '@headlessui/react';
import { Form, Link } from '@remix-run/react';
import { ArchiveBoxIcon, ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import { MenuTransition } from '~/design-system/Transitions';
import { TalkDeleteMenu } from './TalkDelete';

export function TalkActionsMenu() {
  return (
    <Menu as="div" className="relative z-10 inline-block text-left">
      <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
        Actions
        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <MenuTransition>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              <Link to="edit" className="group flex items-center px-4 py-2 text-sm">
                <PencilSquareIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Edit
              </Link>
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              <Form method="post">
                <input type="hidden" name="_action" value="archive-talk" />
                <button type="submit" className="group flex w-full items-center px-4 py-2 text-sm">
                  <ArchiveBoxIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Archive
                </button>
              </Form>
            </Menu.Item>
            <Menu.Item>
              <TalkDeleteMenu />
            </Menu.Item>
          </div>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}
