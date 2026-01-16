import { Menu, MenuButton, MenuItem, MenuItems, MenuSection, MenuSeparator } from '@headlessui/react';
import {
  ArrowDownTrayIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  TrashIcon,
  ViewColumnsIcon,
} from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { useParams, useSubmit } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { menuItem, menuItemIcon, menuItems, menuSection, menuSeparator } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import type { ZoomHandlers } from './use-zoom-handlers.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen.tsx';

type Props = { openTracksModal: VoidFunction; zoomHandlers: ZoomHandlers };

export function OptionsMenu({ openTracksModal, zoomHandlers }: Props) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const params = useParams();

  const scheduleFullscreen = useScheduleFullscreen();
  const FullscreenIcon = scheduleFullscreen.isFullscreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon;

  const handleDelete = () => {
    if (!confirm(t('event-management.schedule.actions.delete.confirm'))) return;
    submit({ intent: 'delete-schedule' }, { method: 'POST' });
  };

  return (
    <Menu>
      <MenuButton as={Button} variant="secondary" iconLeft={Cog6ToothIcon}>
        {t('common.options')}
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          <MenuSection className={menuSection()}>
            <MenuItem
              as="button"
              onClick={zoomHandlers.zoomIn}
              disabled={!zoomHandlers.canZoomIn}
              className={menuItem()}
            >
              <MagnifyingGlassPlusIcon className={menuItemIcon()} aria-hidden="true" />
              {t('common.zoom-in')}
            </MenuItem>
            <MenuItem
              as="button"
              onClick={zoomHandlers.zoomOut}
              disabled={!zoomHandlers.canZoomOut}
              className={menuItem()}
            >
              <MagnifyingGlassMinusIcon className={menuItemIcon()} aria-hidden="true" />
              {t('common.zoom-out')}
            </MenuItem>
            <MenuItem as="button" onClick={scheduleFullscreen.toggle} className={menuItem()}>
              <FullscreenIcon className={menuItemIcon()} aria-hidden="true" />
              {scheduleFullscreen.isFullscreen
                ? t('event-management.schedule.actions.fullscreen.on')
                : t('event-management.schedule.actions.fullscreen.off')}
            </MenuItem>
          </MenuSection>

          <MenuSeparator className={menuSeparator()} />

          <MenuSection className={menuSection()}>
            <MenuItem as="button" onClick={openTracksModal} className={menuItem()}>
              <ViewColumnsIcon className={menuItemIcon()} aria-hidden="true" />
              {t('event-management.schedule.actions.tracks')}
            </MenuItem>
            <MenuItem as="a" href={`/team/${params.team}/${params.event}/schedule/export/json`} className={menuItem()}>
              <ArrowDownTrayIcon className={menuItemIcon()} aria-hidden="true" />
              {t('event-management.schedule.actions.export.json')}
            </MenuItem>
          </MenuSection>

          <MenuSeparator className={menuSeparator()} />

          <MenuSection className={menuSection()}>
            <MenuItem as="button" className={menuItem({ variant: 'important' })} onClick={handleDelete}>
              <TrashIcon className={menuItemIcon({ variant: 'important' })} aria-hidden="true" />
              {t('event-management.schedule.actions.delete.button')}
            </MenuItem>
          </MenuSection>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
