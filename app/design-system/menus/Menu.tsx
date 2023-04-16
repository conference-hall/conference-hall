import type { ReactNode } from 'react';
import { Fragment } from 'react';
import cn from 'classnames';
import { Menu as MenuDropdown } from '@headlessui/react';
import type { FormProps, LinkProps } from '@remix-run/react';
import { Form } from '@remix-run/react';
import { Link } from '@remix-run/react';
import { MenuTransition } from '~/design-system/Transitions';

type MenuProps = {
  trigger: React.ComponentType;
  triggerLabel?: string;
  triggerClassname?: string;
  children: ReactNode;
};

export function Menu({ trigger: Trigger, triggerLabel, triggerClassname, children }: MenuProps) {
  return (
    <MenuDropdown as="div" className="relative z-20 ml-3 shrink-0">
      <MenuDropdown.Button className={triggerClassname}>
        {triggerLabel && <span className="sr-only">{triggerLabel}</span>}
        <Trigger />
      </MenuDropdown.Button>
      <MenuTransition>
        <MenuDropdown.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {children}
        </MenuDropdown.Items>
      </MenuTransition>
    </MenuDropdown>
  );
}

type MenuItemBase = { icon?: React.ComponentType<{ className?: string }> };

const itemStyles = (active: boolean, className?: string) =>
  cn('group flex w-full items-center px-4 py-2 text-sm text-gray-700', {
    'bg-gray-100 text-gray-900': active,
    className,
  });

type MenuItemLinkProps = MenuItemBase & LinkProps;

function ItemLink({ icon: Icon, className, children, ...rest }: MenuItemLinkProps) {
  return (
    <MenuDropdown.Item as={Fragment}>
      {({ active }) => (
        <Link {...rest} className={itemStyles(active, className)}>
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
          {children}
        </Link>
      )}
    </MenuDropdown.Item>
  );
}

Menu.ItemLink = ItemLink;

type MenuItemFormProps = MenuItemBase & FormProps;

function ItemForm({ icon: Icon, className, children, ...rest }: MenuItemFormProps) {
  return (
    <MenuDropdown.Item as={Fragment}>
      {({ active }) => (
        <Form {...rest} className={itemStyles(active, className)}>
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
          {children}
        </Form>
      )}
    </MenuDropdown.Item>
  );
}

Menu.ItemForm = ItemForm;

type MenuItemExternalLinkProps = MenuItemBase & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function ItemExternalLink({ icon: Icon, className, children, ...rest }: MenuItemExternalLinkProps) {
  return (
    <MenuDropdown.Item as={Fragment}>
      {({ active }) => (
        <a {...rest} className={itemStyles(active, className)}>
          {Icon && <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
          {children}
        </a>
      )}
    </MenuDropdown.Item>
  );
}

Menu.ItemExternalLink = ItemExternalLink;
