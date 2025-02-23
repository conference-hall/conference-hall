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
import { cva } from 'class-variance-authority';
import { useParams, useSubmit } from 'react-router';
import { button } from '~/design-system/buttons.tsx';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { useScheduleFullscreen } from './use-schedule-fullscreen';
import type { ZoomHandlers } from './use-zoom-handlers';

// TODO: Use it in other menus ?
const menuItem = cva(['flex items-center w-full gap-3 px-4 py-2 text-sm cursor-pointer'], {
  variants: {
    variant: {
      primary:
        'text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed',
      important: 'font-semibold text-red-700 data-[focus]:bg-red-100 data-[disabled]:text-red-400',
    },
  },
  defaultVariants: { variant: 'primary' },
});

const menuItemIcon = cva(['size-4'], {
  variants: { variant: { primary: 'text-gray-500', important: 'text-red-700' } },
  defaultVariants: { variant: 'primary' },
});

type Props = { openTracksModal: VoidFunction; zoomHandlers: ZoomHandlers };

export function OptionsMenu({ openTracksModal, zoomHandlers }: Props) {
  const submit = useSubmit();
  const params = useParams();

  const scheduleFullscreen = useScheduleFullscreen();
  const FullscreenIcon = scheduleFullscreen.isFullscreen ? ArrowsPointingInIcon : ArrowsPointingOutIcon;

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) return;
    submit({ intent: 'delete-schedule' }, { method: 'POST' });
  };

  return (
    <Menu>
      <MenuButton className={button({ variant: 'secondary' })}>
        <Cog6ToothIcon className="size-4 text-gray-500" aria-hidden="true" />
        Options
      </MenuButton>

      <MenuTransition>
        <MenuItems
          anchor={{ to: 'bottom end', gap: '8px' }}
          className="z-30 w-52 rounded-md bg-white shadow-md ring-1 ring-black/5 focus:outline-hidden"
        >
          <MenuSection>
            <MenuItem
              as="button"
              onClick={zoomHandlers.zoomIn}
              disabled={!zoomHandlers.canZoomIn}
              className={menuItem()}
            >
              <MagnifyingGlassPlusIcon className={menuItemIcon()} aria-hidden="true" />
              Zoom in
            </MenuItem>
            <MenuItem
              as="button"
              onClick={zoomHandlers.zoomOut}
              disabled={!zoomHandlers.canZoomOut}
              className={menuItem()}
            >
              <MagnifyingGlassMinusIcon className={menuItemIcon()} aria-hidden="true" />
              Zoom out
            </MenuItem>
            <MenuItem as="button" onClick={scheduleFullscreen.toggle} className={menuItem()}>
              <FullscreenIcon className={menuItemIcon()} aria-hidden="true" />
              {scheduleFullscreen.isFullscreen ? 'Exit fullscreen' : 'Expand schedule'}
            </MenuItem>
          </MenuSection>

          <MenuSeparator className="h-px bg-gray-200" />

          <MenuSection>
            <MenuItem as="button" onClick={openTracksModal} className={menuItem()}>
              <ViewColumnsIcon className={menuItemIcon()} aria-hidden="true" />
              Manage tracks
            </MenuItem>
            <MenuItem as="a" href={`/team/${params.team}/${params.event}/schedule/export/json`} className={menuItem()}>
              <ArrowDownTrayIcon className={menuItemIcon()} aria-hidden="true" />
              Export as JSON
            </MenuItem>
          </MenuSection>

          <MenuSeparator className="h-px bg-gray-200" />

          <MenuSection>
            <MenuItem as="button" className={menuItem({ variant: 'important' })} onClick={handleDelete}>
              <TrashIcon className={menuItemIcon({ variant: 'important' })} aria-hidden="true" />
              Delete schedule
            </MenuItem>
          </MenuSection>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
