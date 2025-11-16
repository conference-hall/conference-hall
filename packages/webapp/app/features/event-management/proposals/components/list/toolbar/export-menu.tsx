import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CalendarDaysIcon, CodeBracketIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/react/16/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form, useFetchers, useParams, useSearchParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';

export function ExportMenu() {
  const { t } = useTranslation();
  const { team, event } = useCurrentEventTeam();

  const params = useParams();
  const [searchParams] = useSearchParams();

  const fetchers = useFetchers();
  const loading = fetchers.some(
    (fetcher) => fetcher.key === 'exports' && ['submitting', 'loading'].includes(fetcher.state),
  );

  const isOpenPlannerEnabled = event.integrations.includes('OPEN_PLANNER');

  if (!team.userPermissions.canExportEventProposals) return null;

  return (
    <Menu>
      <MenuButton as={Button} variant="secondary" block iconLeft={ArrowDownTrayIcon} disabled={loading}>
        {loading ? t('event-management.proposals.export.loading') : t('event-management.proposals.export.label')}
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          <MenuItem
            as="a"
            href={`/team/${params.team}/${params.event}/export/json?${searchParams.toString()}`}
            className={menuItem()}
          >
            <CodeBracketIcon className={menuItemIcon()} aria-hidden="true" />
            {t('event-management.proposals.export.json')}
          </MenuItem>

          <MenuItem
            as="a"
            href={`/team/${params.team}/${params.event}/export/csv?${searchParams.toString()}`}
            className={menuItem()}
          >
            <TableCellsIcon className={menuItemIcon()} aria-hidden="true" />
            {t('event-management.proposals.export.csv')}
          </MenuItem>

          <MenuItem
            as="a"
            href={`/team/${params.team}/${params.event}/export/cards?${searchParams.toString()}`}
            target="_blank"
            className={menuItem()}
          >
            <Squares2X2Icon className={menuItemIcon()} aria-hidden="true" />
            {t('event-management.proposals.export.cards')}
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
                {t('event-management.proposals.export.open-planner')}
              </button>
            </MenuItem>
          ) : null}
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
