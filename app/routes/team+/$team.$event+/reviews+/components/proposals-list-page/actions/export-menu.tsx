import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CalendarDaysIcon, CodeBracketIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/react/16/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
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
    <Menu>
      <MenuButton className={button({ variant: 'secondary', loading })} disabled={loading}>
        <ArrowDownTrayIcon className="size-4 text-gray-500" aria-hidden="true" />
        <span>{loading ? 'Exporting...' : 'Export'}</span>
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          <MenuItem
            as="a"
            href={`/team/${params.team}/${params.event}/export/json?${searchParams.toString()}`}
            className={menuItem()}
          >
            <CodeBracketIcon className={menuItemIcon()} aria-hidden="true" />
            As JSON
          </MenuItem>

          <MenuItem
            as="a"
            href={`/team/${params.team}/${params.event}/export/csv?${searchParams.toString()}`}
            className={menuItem()}
          >
            <TableCellsIcon className={menuItemIcon()} aria-hidden="true" />
            As CSV
          </MenuItem>

          <MenuItem
            as="a"
            href={`/team/${params.team}/${params.event}/export/cards?${searchParams.toString()}`}
            className={menuItem()}
          >
            <Squares2X2Icon className={menuItemIcon()} aria-hidden="true" />
            As printable cards
          </MenuItem>

          {isOpenPlannerEnabled ? (
            <MenuItem
              as={Form}
              method="POST"
              action={`/team/${params.team}/${params.event}/export/open-planner?${searchParams.toString()}`}
              navigate={false}
              fetcherKey="exports"
              className={menuItem()}
            >
              <CalendarDaysIcon className={menuItemIcon()} aria-hidden="true" />
              <button type="submit" className="w-full text-left cursor-pointer">
                To OpenPlanner
              </button>
            </MenuItem>
          ) : null}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
