import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { href, useParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import type { ScheduleProposalData } from '../schedule.types.ts';
import { highlightMatch } from './highlight-match.tsx';
import { useProposalSearch } from './use-proposal-search.ts';

export type SessionIdentity = { name: string; proposal: ScheduleProposalData | null };

type OptionValue = { kind: 'raw' } | { kind: 'proposal'; proposal: ScheduleProposalData };

type Props = {
  name: string;
  proposal: ScheduleProposalData | null;
  onChange: (identity: SessionIdentity) => void;
};

export function SessionIdentityField({ name, proposal, onChange }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { results, isSearching, search } = useProposalSearch();

  const trimmed = name.trim();
  const isOpen = focused && trimmed.length > 0 && !dismissed;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDismissed(false);
    onChange({ name: value, proposal: null });
    if (value.trim()) search(value.trim());
  };

  const handleSelect = (value: OptionValue | null) => {
    if (!value) return;
    if (value.kind === 'raw') {
      setDismissed(true);
    } else {
      onChange({ name: '', proposal: value.proposal });
    }
  };

  const handleClear = () => {
    setDismissed(false);
    onChange({ name: '', proposal: null });
    if (inputRef.current) inputRef.current.value = '';
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
            // Reopening an existing raw name should refresh the proposal list.
            if (trimmed.length > 0) search(trimmed);
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
            {isSearching ? (
              <LoadingIcon className="h-4 w-4 shrink-0" aria-label={t('common.loading')} />
            ) : (
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            )}
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
              className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 select-none data-focus:bg-gray-100"
            >
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
                className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 select-none data-focus:bg-gray-100"
              >
                <div className="min-w-0 flex-auto">
                  <div className="flex gap-1">
                    <Text weight="medium" variant="secondary">
                      #{highlightMatch(result.routeId, trimmed)}
                    </Text>
                    <Text weight="medium" truncate>
                      {highlightMatch(result.title, trimmed)}
                    </Text>
                  </div>
                  <Subtitle size="xs" truncate>
                    {highlightMatch(t('common.by', { names: result.speakers.map((s) => s.name) }), trimmed)}
                  </Subtitle>
                </div>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        ) : null}
      </Combobox>
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
    <div className="flex items-start justify-between gap-4 rounded-md p-3 ring-1 ring-gray-300 ring-inset">
      <div className="min-w-0">
        <div className="flex gap-1">
          <Text weight="medium" variant="secondary">
            #{proposal.routeId}
          </Text>
          <Text weight="medium" truncate>
            {proposal.title}
          </Text>
        </div>
        <Subtitle size="xs" truncate>
          {t('common.by', { names: proposal.speakers.map((s) => s.name) })}
        </Subtitle>
      </div>
      <div className="flex shrink-0 gap-2">
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
          rel="noreferrer"
          size="sm"
        />
        <Button
          icon={XMarkIcon}
          label={t('event-management.schedule.edit-session.identity.change')}
          type="button"
          onClick={onDetach}
          variant="secondary"
          size="sm"
        />
      </div>
    </div>
  );
}
