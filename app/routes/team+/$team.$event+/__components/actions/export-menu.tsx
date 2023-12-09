import { Menu } from '@headlessui/react';
import { ArrowDownTrayIcon, CodeBracketIcon } from '@heroicons/react/20/solid';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import { useParams, useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react';

import { button } from '~/design-system/Buttons';
import { MenuTransition } from '~/design-system/Transitions';
import { useTeam } from '~/routes/team+/$team';

const exportItems = [
  { name: 'As JSON', path: 'json', icon: CodeBracketIcon },
  { name: 'As printable cards', path: 'cards', icon: Squares2X2Icon },
];

export function ExportMenu() {
  const { team } = useTeam();
  const params = useParams();
  const [searchParams] = useSearchParams();

  if (team.role !== 'OWNER') return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={button({ variant: 'secondary' })}>
        <ArrowDownTrayIcon className="h-4 w-4 text-gray-500" />
        <span className="hidden sm:inline">Export</span>
      </Menu.Button>
      <MenuTransition>
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {exportItems.map(({ name, path, icon }) => (
              <ExportMenuItem
                key={path}
                icon={icon}
                href={`/team/${params.team}/${params.event}/export/${path}?${searchParams.toString()}`}
              >
                {name}
              </ExportMenuItem>
            ))}
          </div>
        </Menu.Items>
      </MenuTransition>
    </Menu>
  );
}

function ExportMenuItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Menu.Item as={Fragment}>
      {({ active }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cx(
            'relative flex items-center gap-3 px-4 py-2 text-sm',
            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
          )}
        >
          <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {children}
        </a>
      )}
    </Menu.Item>
  );
}
