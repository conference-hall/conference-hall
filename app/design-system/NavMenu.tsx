import c from 'classnames';
import { NavLink } from '@remix-run/react';
import { IconLabel } from './IconLabel';

type NavItem = { to: string; icon: React.ComponentType<{ className?: string }>; label: string };

type Props = { items: Array<NavItem>; className?: string };

export function NavMenu({ items, className }: Props) {
  return (
    <aside className={c('py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0', className)}>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={menuStyles} end>
            <IconLabel icon={item.icon} iconClassName="text-gray-400 group-hover:text-gray-500">
              {item.label}
            </IconLabel>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function menuStyles({ isActive }: { isActive: boolean }) {
  return c(
    'group relative flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900',
    { 'bg-gray-100 font-bold': isActive }
  );
}
