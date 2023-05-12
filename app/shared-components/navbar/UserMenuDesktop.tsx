import { ArrowRightOnRectangleIcon, StarIcon } from '@heroicons/react/20/solid';
import { Menu } from '~/design-system/menus/Menu';
import { Avatar } from '~/design-system/Avatar';

type Props = { name: string | null; email?: string | null; picture?: string | null; isOrganizer?: boolean };

export function UserMenuDesktop({ name, email, picture, isOrganizer }: Props) {
  const UserAvatar = () => <Avatar picture={picture} name={name} size="s" />;

  return (
    <Menu
      trigger={UserAvatar}
      triggerLabel="Open user menu"
      triggerClassname="flex flex-shrink-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
    >
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-sm">Signed in as</p>
        <p className="truncate text-sm font-medium text-gray-900">{email}</p>
      </div>

      {!isOrganizer && (
        <Menu.ItemLink to="/organizer" icon={StarIcon}>
          Become organizer
        </Menu.ItemLink>
      )}

      <Menu.ItemLink to="/logout" icon={ArrowRightOnRectangleIcon}>
        Sign out
      </Menu.ItemLink>
    </Menu>
  );
}
