import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, DocumentTextIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { href, useFetcher, useParams } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '~/design-system/button.tsx';
import type { ProposalResult } from '~/features/event-management/autocomplete/types/autocomplete.types.ts';
import type { loader as AutocompleteLoader } from '../../../autocomplete/autocomplete.ts';
import type { ScheduleProposalData } from '../schedule.types.ts';

export type SessionIdentity = { name: string; proposal: ScheduleProposalData | null };

type OptionValue = { kind: 'raw' } | { kind: 'proposal'; proposal: ScheduleProposalData };

type Props = {
  name: string;
  proposal: ScheduleProposalData | null;
  onChange: (identity: SessionIdentity) => void;
};

export function SessionIdentityField({ name, proposal, onChange }: Props) {
  const { t } = useTranslation();
  const { team, event } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pendingFocus = useRef(false);

  // Autofocus only for a brand-new empty session, never when editing an existing one.
  const [autoFocus] = useState(() => !name.trim() && !proposal);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Refocus the empty input after detaching a proposal (card → input transition).
  useEffect(() => {
    if (!proposal && pendingFocus.current) {
      pendingFocus.current = false;
      inputRef.current?.focus();
    }
  }, [proposal]);

  const fetcher = useFetcher<typeof AutocompleteLoader>();
  const results = (fetcher.data ?? []).filter((item): item is ProposalResult => item.kind === 'proposals');

  const search = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams({ query, kind: 'proposals' });
    const route = href('/team/:team/:event/autocomplete', { team: team ?? '', event: event ?? '' });
    fetcher.load(`${route}?${params.toString()}`);
  }, 300);

  const trimmed = name.trim();
  const isOpen = focused && trimmed.length > 0 && !dismissed;
  const showCaption = !proposal && trimmed.length > 0 && !isOpen;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDismissed(false);
    onChange({ name: value, proposal: null });
    if (value.trim()) search(value.trim());
  };

  const handleSelect = (value: OptionValue | null) => {
    if (!value) return;
    if (value.kind === 'raw') {
      // "Create raw session" only closes the list; the raw session already exists via `name`.
      setDismissed(true);
      inputRef.current?.focus();
    } else {
      onChange({ name: '', proposal: value.proposal });
    }
  };

  const handleClear = () => {
    setDismissed(false);
    onChange({ name: '', proposal: null });
    // The input is uncontrolled (synced via displayValue); clear it imperatively.
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setDismissed(true);
    } else if (e.key === 'Enter' && !isOpen) {
      // Never let the field implicitly submit the modal form.
      e.preventDefault();
    }
  };

  const handleDetach = () => {
    pendingFocus.current = true;
    onChange({ name: '', proposal: null });
  };

  if (proposal) {
    return <LinkedProposalCard proposal={proposal} onDetach={handleDetach} />;
  }

  return (
    <div className="relative">
      {/* Spacer reserves the input row height in normal flow and never grows. */}
      <div className="h-11" aria-hidden="true" />

      {/* Absolutely-positioned bordered box: the expanding list overlays the fields below. */}
      <Combobox
        as="div"
        value={null}
        onChange={handleSelect}
        className={cx(
          'absolute inset-x-0 top-0 z-10 rounded-md bg-white transition-shadow',
          isOpen ? 'shadow-lg ring-2 ring-indigo-600' : 'ring-1 ring-gray-300',
        )}
      >
        <ComboboxInput
          ref={inputRef}
          autoComplete="off"
          // Uncontrolled: Headless keeps the text in sync via displayValue, so Esc/blur
          // never wipe the typed name (the combobox value stays null).
          displayValue={() => name}
          onChange={handleInputChange}
          onFocus={() => {
            setFocused(true);
            setDismissed(false);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={t('event-management.schedule.edit-session.identity.placeholder')}
          aria-label={t('event-management.schedule.edit-session.name')}
          className="h-11 w-full rounded-md border-0 bg-transparent pr-10 pl-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0"
        />

        {/* A ComboboxButton stays interactive while open (Headless inerts non-part siblings). */}
        {trimmed.length > 0 ? (
          <ComboboxButton
            as="button"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            aria-label={t('event-management.schedule.edit-session.identity.clear')}
            className="absolute top-2.5 right-2 z-20 flex size-6 items-center justify-center rounded-md text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </ComboboxButton>
        ) : null}

        {isOpen ? (
          <ComboboxOptions
            static
            as="ul"
            // Keep the input focused when clicking an option so the list does not flash closed.
            onMouseDown={(e) => e.preventDefault()}
            className="max-h-60 overflow-y-auto border-t border-gray-200 p-1 text-sm motion-safe:transition-opacity"
          >
            <ComboboxOption
              value={{ kind: 'raw' }}
              as="li"
              className="group flex cursor-default items-center gap-3 rounded-md px-3 py-2 select-none data-focus:bg-indigo-600 data-focus:text-white"
            >
              <PencilSquareIcon
                className="h-5 w-5 shrink-0 text-gray-400 group-data-focus:text-white"
                aria-hidden="true"
              />
              <span className="truncate">
                <Trans
                  i18nKey="event-management.schedule.edit-session.identity.create-raw"
                  values={{ name: trimmed }}
                  components={[<strong key="0" className="font-semibold" />]}
                />
              </span>
            </ComboboxOption>

            {results.map((result) => (
              <ComboboxOption
                value={{ kind: 'proposal', proposal: result }}
                as="li"
                key={result.id}
                className="group flex cursor-default items-center gap-3 rounded-md px-3 py-2 select-none data-focus:bg-gray-100"
              >
                <DocumentTextIcon
                  className="h-5 w-5 shrink-0 text-gray-400 group-data-focus:text-indigo-600"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-auto">
                  <p className="truncate font-medium text-gray-900">{result.title}</p>
                  <p className="truncate text-xs text-gray-500">
                    {result.speakers.map((speaker) => speaker.name).join(', ')}
                  </p>
                </div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        ) : null}
      </Combobox>

      {showCaption ? (
        <p className="mt-1 text-xs text-gray-500">{t('event-management.schedule.edit-session.identity.raw-caption')}</p>
      ) : null}
    </div>
  );
}

type LinkedProposalCardProps = {
  proposal: ScheduleProposalData;
  onDetach: VoidFunction;
};

function LinkedProposalCard({ proposal, onDetach }: LinkedProposalCardProps) {
  const { t } = useTranslation();
  const { team, event } = useParams();

  return (
    <div className="flex items-start justify-between gap-4 rounded-md ring-1 ring-gray-300 ring-inset">
      <div className="min-w-0 px-3 py-2">
        <p className="font-semibold text-gray-900">{proposal.title}</p>
        <p className="truncate text-sm text-gray-500">{proposal.speakers.map((s) => s.name).join(', ')}</p>
      </div>
      <div className="flex shrink-0 gap-2 p-2">
        <Button
          icon={ArrowTopRightOnSquareIcon}
          label={t('event-management.schedule.edit-session.proposal.see')}
          to={href('/team/:team/:event/proposals/:proposal', {
            team: team ?? '',
            event: event ?? '',
            proposal: proposal.routeId,
          })}
          variant="secondary"
          target="_blank"
        />
        <Button
          icon={XMarkIcon}
          label={t('event-management.schedule.edit-session.identity.change')}
          type="button"
          onClick={onDetach}
          variant="secondary"
        />
      </div>
    </div>
  );
}
