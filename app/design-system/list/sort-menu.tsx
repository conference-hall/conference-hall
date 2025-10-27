import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { Button } from '../button.tsx';
import { menuItem, menuItemIcon, menuItems } from '../styles/menu.styles.ts';

type SortMenuProps = {
  options: Array<{ name: string; value: string }>;
  defaultSort?: string;
  defaultOrder?: string;
};

export function SortMenu({ options, defaultSort, defaultOrder }: SortMenuProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [params] = useSearchParams();
  const { sort = defaultSort, order = defaultOrder, ...others } = Object.fromEntries(params.entries());

  return (
    <Menu>
      <MenuButton as={Button} variant="secondary" iconLeft={ArrowsUpDownIcon}>
        {t('common.sort')}
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          {options.map(({ name, value }) => {
            const selected = value === sort;
            const orderValue = selected && order === 'asc' ? 'desc' : 'asc';
            const search = new URLSearchParams({ ...others, sort: value, order: orderValue });

            return (
              <MenuItem
                key={value}
                as={Link}
                to={{ pathname: location.pathname, search: search.toString() }}
                className={cx('flex items-center justify-between', menuItem(), { 'font-semibold': selected })}
              >
                {name}
                {selected && order === 'asc' ? (
                  <ArrowDownIcon className={menuItemIcon()} aria-label="Ascending sort" />
                ) : selected && order === 'desc' ? (
                  <ArrowUpIcon className={menuItemIcon()} aria-label="Descending sort" />
                ) : null}
              </MenuItem>
            );
          })}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
