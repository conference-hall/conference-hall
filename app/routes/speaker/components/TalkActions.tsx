import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ArchiveIcon, ChevronDownIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/solid';
import { Form, Link } from '@remix-run/react';
import { Button } from '../../../components/Buttons';

export default function TalkActions() {
  return (
    <Menu as="div" className="relative inline-block text-left z-10">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
          Actions
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              <Link to="edit" className="group flex items-center px-4 py-2 text-sm">
                <PencilAltIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Edit
              </Link>
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              <Form method="post">
                <input type="hidden" name="_action" value="archive-talk" />
                <button type="submit" className="group flex w-full items-center px-4 py-2 text-sm">
                  <ArchiveIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Archive
                </button>
              </Form>
            </Menu.Item>
            <Menu.Item>
              <a href="#" className="group flex items-center px-4 py-2 text-sm">
                <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Delete
              </a>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
