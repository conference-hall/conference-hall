import { Link } from '@remix-run/react';
import { BellIcon } from '@heroicons/react/24/outline';

export type Notification = {
  type: string;
  proposal: { id: string; title: string };
  event: { slug: string; name: string };
};

type Props = { notifications: Array<Notification> | null };

export function NotificationsLink({ notifications }: Props) {
  const hasNotifications = !!notifications && notifications?.length > 0;

  return (
    <div className="relative ml-3 block">
      <Link
        to="/notifications"
        className="inline-flex flex-shrink-0 items-center rounded-full p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {hasNotifications && <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-red-400" />}
      </Link>
    </div>
  );
}
