import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { CalendarDaysIcon, CodeBracketIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { Form, useFetchers, useParams, useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { Fragment } from 'react';

import { button } from '~/design-system/buttons.tsx';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { useEvent } from '~/routes/team+/$team.$event+/__components/use-event';
import { useTeam } from '~/routes/team+/__components/use-team.tsx';

export function ExportMenu() {
  const { team } = useTeam();
  const { event } = useEvent();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const fetchers = useFetchers();
  const loading = fetchers.some(
    (fetcher) => fetcher.key === 'exports' && ['submitting', 'loading'].includes(fetcher.state),
  );

  const isOpenPlannerEnabled = event.integrations.includes('OPEN_PLANNER');

  if (!team.userPermissions.canExportEventProposals) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={button({ variant: 'secondary', loading })} disabled={loading}>
        <ArrowDownTrayIcon className="h-4 w-4 text-gray-500" />
        <span>{loading ? 'Exporting...' : 'Export'}</span>
      </MenuButton>
      <MenuTransition>
        <MenuItems
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-10 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            <ExportMenuLink
              icon={CodeBracketIcon}
              href={`/team/${params.team}/${params.event}/export/cards?${searchParams.toString()}`}
            >
              As JSON
            </ExportMenuLink>

            <ExportMenuLink
              icon={Squares2X2Icon}
              href={`/team/${params.team}/${params.event}/export/json?${searchParams.toString()}`}
            >
              As printable cards
            </ExportMenuLink>

            {isOpenPlannerEnabled ? (
              <ExportMenuForm
                icon={CalendarDaysIcon}
                action={`/team/${params.team}/${params.event}/export/open-planner?${searchParams.toString()}`}
              >
                To OpenPlanner
              </ExportMenuForm>
            ) : null}
          </div>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}

type ExportMenuLinkProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
};

function ExportMenuLink({ href, icon: Icon, children }: ExportMenuLinkProps) {
  return (
    <MenuItem as={Fragment}>
      {({ focus }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cx(
            'relative flex items-center gap-3 px-4 py-2 text-sm',
            focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
          )}
        >
          <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          {children}
        </a>
      )}
    </MenuItem>
  );
}

type ExportMenuFormProps = {
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
};

function ExportMenuForm({ action, icon: Icon, children }: ExportMenuFormProps) {
  return (
    <MenuItem as={Fragment}>
      {({ focus }) => (
        <Form
          method="POST"
          action={action}
          navigate={false}
          fetcherKey="exports"
          className={cx(
            'relative flex items-center gap-3 px-4 py-2 text-sm',
            focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
          )}
        >
          <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <button type="submit" className="w-full text-left">
            {children}
          </button>
        </Form>
      )}
    </MenuItem>
  );
}
