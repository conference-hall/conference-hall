import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

import { AvatarName } from '~/design-system/Avatar';
import { Text } from '~/design-system/Typography';

import { type Notification, NotificationsLink } from './NotificationsLink';
import { UserMenuMobile } from './UserMenuMobile';

export function MobileMenuButton({ open }: { open: boolean }) {
  return (
    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
      <Text srOnly>Open main menu</Text>
      {open ? (
        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
      ) : (
        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
      )}
    </Disclosure.Button>
  );
}

type MobileMenuProps = {
  user: { name: string | null; email: string | null; picture: string | null };
  notifications: Array<Notification> | null;
};

export function MobileMenuPanel({ user, notifications }: MobileMenuProps) {
  return (
    <Disclosure.Panel className="lg:hidden">
      <div className="border-b border-gray-700 pb-3 pt-4">
        <div className="flex items-center px-5">
          <AvatarName name={user.name} picture={user.picture} subtitle={user.email} size="s" variant="secondary" />
          <div className="ml-auto flex-shrink-0">
            <NotificationsLink notifications={notifications} />
          </div>
        </div>
        <UserMenuMobile />
      </div>
    </Disclosure.Panel>
  );
}
