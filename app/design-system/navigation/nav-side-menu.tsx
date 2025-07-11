import { HeartIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { Badge } from '../badges.tsx';
import { Card } from '../layouts/card.tsx';
import { Text } from '../typography.tsx';

type NavItem = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hidden?: boolean;
  isNew?: boolean;
  end?: boolean;
};

type Props = { items: Array<NavItem>; className?: string };

export function NavSideMenu({ items, className, ...rest }: Props) {
  const { t } = useTranslation();
  return (
    <aside className={cx('w-1/5 space-y-4', className)}>
      <Card as="nav" className="space-y-1 p-2" {...rest}>
        {items
          .filter((item) => !item.hidden)
          .map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => menuStyles(isActive)} end={item.end}>
              <div className="flex items-center">
                <item.icon className="mr-2 size-4 shrink-0" aria-hidden="true" />
                <Text>{item.label}</Text>
              </div>
              {item.isNew ? (
                <Badge color="blue" compact>
                  {t('common.new')}
                </Badge>
              ) : null}
            </NavLink>
          ))}
        <a
          href="https://github.com/sponsors/conference-hall"
          target="_blank"
          className={menuStyles(false)}
          rel="noreferrer"
        >
          <HeartIcon className="mr-2 size-4 shrink-0 fill-red-300 group-hover:fill-red-400" aria-hidden="true" />
          <Text className="grow">{t('common.sponsor')}</Text>
        </a>
      </Card>
    </aside>
  );
}

function menuStyles(isActive: boolean) {
  return cx(
    'group relative flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 hover:text-gray-900',
    { 'bg-gray-100 font-medium': isActive },
  );
}
