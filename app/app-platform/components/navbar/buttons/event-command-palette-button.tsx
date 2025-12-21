import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { usePlatformKbd } from '~/design-system/kbd.tsx';
import { CommandPaletteDialog } from '~/features/event-management/command-palette/components/command-palette/command-palette-dialog.tsx';
import { EventCommandPalette } from '~/features/event-management/command-palette/components/event-command-palette.tsx';

export function EventCommandPaletteButton() {
  // todo: should be given by the loader ?
  const { team, event } = useParams();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { meta } = usePlatformKbd();

  if (!team || !event) return null;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const label = t('event-management.command-palette.event.title');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gray-700 p-1 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gray-400" aria-label={label} />
        <span className="mr-1.5 font-semibold text-gray-400 text-xs">{`${meta}+K`}</span>
      </button>

      <CommandPaletteDialog label={label} open={open} onOpen={handleOpen} onClose={handleClose} withOpenKey>
        <EventCommandPalette team={team} event={event} closeText={`${meta}+K`} onClose={handleClose} />
      </CommandPaletteDialog>
    </>
  );
}
