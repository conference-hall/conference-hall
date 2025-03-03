import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CalendarDaysIcon, CodeBracketIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/react/16/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { Fragment, type HTMLProps } from 'react';
import { Form, useFetchers, useParams, useSearchParams } from 'react-router';
import { button } from '~/design-system/buttons.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';

export function ExportMenu() {
  const currentTeam = useCurrentTeam();

  const params = useParams();
  const [searchParams] = useSearchParams();

  const fetchers = useFetchers();
  const loading = fetchers.some(
    (fetcher) => fetcher.key === 'exports' && ['submitting', 'loading'].includes(fetcher.state),
  );

  const { integrations } = useCurrentEvent();
  const isOpenPlannerEnabled = integrations.includes('OPEN_PLANNER');

  if (!currentTeam.userPermissions.canExportEventProposals) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={button({ variant: 'secondary', loading })} disabled={loading}>
        <ArrowDownTrayIcon className="size-4 text-gray-500" aria-hidden="true" />
        <span>{loading ? 'Exporting...' : 'Export'}</span>
      </MenuButton>
      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          <ExportMenuLink
            icon={CodeBracketIcon}
            href={`/team/${params.team}/${params.event}/export/json?${searchParams.toString()}`}
          >
            As JSON
          </ExportMenuLink>

          <ExportMenuLink
            icon={TableCellsIcon}
            href={`/team/${params.team}/${params.event}/export/csv?${searchParams.toString()}`}
          >
            As CSV
          </ExportMenuLink>

          <ExportMenuLink
            icon={Squares2X2Icon}
            href={`/team/${params.team}/${params.event}/export/cards?${searchParams.toString()}`}
            target="_blank"
            rel="noreferrer"
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
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}

type ExportMenuLinkProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
} & HTMLProps<HTMLLinkElement>;

function ExportMenuLink({ href, icon: Icon, children, target, rel }: ExportMenuLinkProps) {
  return (
    <MenuItem as={Fragment}>
      <a href={href} target={target} rel={rel} className={menuItem()}>
        <Icon className={menuItemIcon()} aria-hidden="true" />
        {children}
      </a>
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
      <Form method="POST" action={action} navigate={false} fetcherKey="exports" className={menuItem()}>
        <Icon className={menuItemIcon()} aria-hidden="true" />
        <button type="submit" className="w-full text-left">
          {children}
        </button>
      </Form>
    </MenuItem>
  );
}
