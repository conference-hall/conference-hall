import { Menu } from '@headlessui/react';
import { Link } from '@remix-run/react';
import { MenuTransition } from '~/design-system/Transitions';
import { BellIcon } from '@heroicons/react/24/outline';

export type Notification = {
  type: string;
  proposal: { id: string; title: string };
  event: { slug: string; name: string };
};

type Props = { notifications: Array<Notification> | null };

type NotificationItemProps = { notification: Notification };

function NotificationItem({ notification }: NotificationItemProps) {
  const { proposal, event } = notification;
  return (
    <Menu.Item>
      <Link
        to={`/${event.slug}/proposals/${proposal.id}`}
        className="flex rounded-lg p-4 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
      >
        <div className="mt-1 flex h-6 w-6 shrink-0">🎉</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">
            <strong>{proposal.title}</strong> has been accepted to <strong>{event.name}</strong>.
          </p>
          <p className="text-sm text-gray-500">Please confirm or decline your participation.</p>
        </div>
      </Link>
    </Menu.Item>
  );
}

export function NotificationMenu({ notifications }: Props) {
  const hasNotifications = !!notifications && notifications?.length > 0;

  return (
    <Menu as="div" className="relative z-30 ml-3">
      <div>
        <Menu.Button className="rounded-full p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {hasNotifications && (
            <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-400 ring-1 ring-white" />
          )}
        </Menu.Button>
      </div>
      <MenuTransition>
        <Menu.Items className="absolute right-0 mt-2 w-96 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {notifications?.map((notification) => (
            <NotificationItem key={notification.proposal.id} notification={notification} />
          ))}
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}
