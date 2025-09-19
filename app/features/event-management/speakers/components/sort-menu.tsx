import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearchParams } from 'react-router';
import { button } from '~/design-system/buttons.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';

const sortOptions = ['name-asc', 'name-desc'] as const;

export function SortMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const [params] = useSearchParams();
  const { sort = 'name-asc', ...filters } = Object.fromEntries(params.entries());

  return (
    <Menu>
      <MenuButton className={button({ variant: 'secondary', block: true })}>
        <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
        <span>{t('common.sort')}</span>
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          {sortOptions.map((value) => {
            const selected = value === sort;
            const search = new URLSearchParams({ ...filters, sort: value });

            return (
              <MenuItem
                key={value}
                as={Link}
                to={{ pathname: location.pathname, search: search.toString() }}
                className={cx('flex items-center justify-between', menuItem(), { 'font-semibold': selected })}
              >
                {t(`common.sort.${value}`)}
                {selected ? <CheckIcon className={menuItemIcon()} aria-hidden="true" /> : null}
              </MenuItem>
            );
          })}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
