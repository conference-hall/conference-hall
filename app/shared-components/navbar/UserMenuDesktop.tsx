import { ArrowRightOnRectangleIcon, StarIcon } from '@heroicons/react/20/solid';
import { getAuth } from 'firebase/auth';
import { Menu } from '~/design-system/menus/Menu';
import { Avatar } from '~/design-system/Avatar';

type Props = { name: string | null; email?: string | null; picture?: string | null; isOrganizer?: boolean };

export function UserMenuDesktop({ name, email, picture, isOrganizer }: Props) {
  const UserAvatar = () => <Avatar photoURL={picture} name={name} size="s" />;

  return (
    <Menu
      trigger={UserAvatar}
      triggerLabel="Open user menu"
      triggerClassname="flex flex-shrink-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
    >
      <div className="px-4 py-3">
        <p className="text-sm">Signed in as</p>
        <p className="truncate text-sm font-medium text-gray-900">{email}</p>
      </div>

      {!isOrganizer && (
        <Menu.ItemLink to="/organizer" icon={StarIcon}>
          Become organizer
        </Menu.ItemLink>
      )}

      <Menu.ItemForm action="/logout" method="POST" icon={ArrowRightOnRectangleIcon}>
        <button type="submit" className="h-full w-full text-left" onClick={() => getAuth().signOut()}>
          Sign out
        </button>
      </Menu.ItemForm>
    </Menu>
  );
}
