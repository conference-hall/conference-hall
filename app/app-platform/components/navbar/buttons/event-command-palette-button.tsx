import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { formatForDisplay } from '@tanstack/react-hotkeys';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { CommandPaletteDialog } from '~/features/event-management/command-palette/components/command-palette/command-palette-dialog.tsx';
import { EventCommandPalette } from '~/features/event-management/command-palette/components/event-command-palette.tsx';

export function EventCommandPaletteButton() {
  const { team, event } = useParams();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!team || !event) return null;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const label = t('event-management.command-palette.event.title');
  const shortcutDisplay = formatForDisplay('Mod+K');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gray-700 p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gray-400" aria-label={label} />
        <span className="mr-1.5 text-xs font-semibold text-gray-400">{shortcutDisplay}</span>
      </button>

      <CommandPaletteDialog label={label} open={open} onOpen={handleOpen} onClose={handleClose}>
        <EventCommandPalette team={team} event={event} closeText={shortcutDisplay} onClose={handleClose} />
      </CommandPaletteDialog>
    </>
  );
}
