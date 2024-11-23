import { NavLink } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { SponsorLink } from '~/routes/__components/sponsor-link.tsx';
import { Badge } from '../badges.tsx';
import { IconLabel } from '../icon-label.tsx';
import { Card } from '../layouts/card.tsx';

type NavItem = { to: string; icon: React.ComponentType<{ className?: string }>; label: string; isNew?: boolean };

type Props = { items: Array<NavItem>; noActive?: boolean; className?: string };

export function NavSideMenu({ items, noActive, className, ...rest }: Props) {
  return (
    <aside className={cx('w-1/5 space-y-4', className)}>
      <Card p={4} as="nav" className="space-y-1" {...rest}>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => menuStyles(isActive, noActive)} end>
            <IconLabel icon={item.icon}>{item.label}</IconLabel>
            {item.isNew ? (
              <Badge color="blue" compact>
                New
              </Badge>
            ) : null}
          </NavLink>
        ))}
      </Card>

      <SponsorLink />
    </aside>
  );
}

function menuStyles(isActive: boolean, noActive?: boolean) {
  return cx(
    'group relative flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 hover:text-gray-900',
    { 'bg-gray-100 font-medium': isActive && !noActive },
  );
}
