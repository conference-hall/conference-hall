import { Menu as MenuDropdown, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { FormProps, LinkProps } from '@remix-run/react';
import { Form, Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { MenuTransition } from '~/design-system/Transitions.tsx';

type MenuProps = {
  trigger: React.ComponentType;
  triggerLabel?: string;
  triggerClassname?: string;
  children: ReactNode;
};

export function Menu({ trigger: Trigger, triggerLabel, triggerClassname, children }: MenuProps) {
  return (
    <MenuDropdown as="div" className="relative z-20 ml-3 shrink-0">
      <MenuButton className={triggerClassname}>
        {triggerLabel && <span className="sr-only">{triggerLabel}</span>}
        <Trigger />
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-10 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {children}
        </MenuItems>
      </MenuTransition>
    </MenuDropdown>
  );
}

type MenuItemBase = { icon?: React.ComponentType<{ className?: string }> };

const itemStyles = (active: boolean, className?: string) =>
  cx('group flex w-full items-center px-4 py-2 text-sm text-gray-700', {
    'bg-gray-100 text-gray-900': active,
    className,
  });

type MenuItemLinkProps = MenuItemBase & LinkProps;

function ItemLink({ icon: Icon, className, children, ...rest }: MenuItemLinkProps) {
  return (
    <MenuItem as={Fragment}>
      {({ focus }) => (
        <Link {...rest} className={itemStyles(focus, className)}>
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
          {children}
        </Link>
      )}
    </MenuItem>
  );
}

Menu.ItemLink = ItemLink;

type MenuItemFormProps = MenuItemBase & FormProps;

function ItemForm({ icon: Icon, className, children, ...rest }: MenuItemFormProps) {
  return (
    <MenuItem as={Fragment}>
      {({ focus }) => (
        <Form {...rest} className={itemStyles(focus, className)}>
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
          {children}
        </Form>
      )}
    </MenuItem>
  );
}

Menu.ItemForm = ItemForm;

type MenuItemExternalLinkProps = MenuItemBase & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function ItemExternalLink({ icon: Icon, className, children, ...rest }: MenuItemExternalLinkProps) {
  return (
    <MenuItem as={Fragment}>
      {({ focus }) => (
        <a {...rest} className={itemStyles(focus, className)}>
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
          {children}
        </a>
      )}
    </MenuItem>
  );
}

Menu.ItemExternalLink = ItemExternalLink;
