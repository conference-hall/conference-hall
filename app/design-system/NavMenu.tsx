import c from 'classnames';
import { NavLink } from '@remix-run/react';
import { IconLabel } from './IconLabel';

type NavItem = { to: string; icon: React.ComponentType<{ className?: string }>; label: string };

type Props = { items: Array<NavItem>; className?: string };

export function NavMenu({ items, className, ...rest }: Props) {
  return (
    <aside className={className}>
      <nav className="space-y-1" {...rest}>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={menuStyles} end>
            <IconLabel icon={item.icon}>{item.label}</IconLabel>
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
