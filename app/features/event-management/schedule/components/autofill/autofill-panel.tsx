import { Fieldset, Legend, Radio, RadioGroup } from '@headlessui/react';
import { LockClosedIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Checkbox } from '~/design-system/forms/input-checkbox.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import {
  type AutofillPayload,
  type AutofillReason,
  type AutofillReport,
  type AutofillScope,
  type ProposalState,
  PROPOSAL_STATES,
  autofill,
  isEligibleProposal,
  vacantSessionCount,
} from '../../models/autofill.ts';

type Props = { payload: AutofillPayload; report: AutofillReport | null; onClose: VoidFunction };

export function AutofillPanel({ payload, report, onClose }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [scope, setScope] = useState<AutofillScope>(() => ({
    days: payload.days,
    trackIds: payload.tracks.map((track) => track.id),
    proposalState: 'accepted',
    reset: false,
  }));

  // The scope that produced the report on screen: touching a filter brings the summary back.
  const [submittedScope, setSubmittedScope] = useState<AutofillScope | null>(null);
  const displayedReport = submittedScope === scope ? report : null;

  // The summary is not a count of sets, it is a dry-run of the very function that will write.
  const summary = useMemo(() => autofill(payload, scope), [payload, scope]);

  if (payload.sessions.length === 0) {
    return (
      <SlideOver open title={t('event-management.schedule.autofill.heading')} size="m" onClose={onClose}>
        <SlideOver.Content>
          <Text weight="semibold">{t('event-management.schedule.autofill.empty.heading')}</Text>
          <Subtitle>{t('event-management.schedule.autofill.empty.description')}</Subtitle>
        </SlideOver.Content>
        <SlideOver.Actions>
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </SlideOver.Actions>
      </SlideOver>
    );
  }

  return (
    <SlideOver open title={t('event-management.schedule.autofill.heading')} size="m" onClose={onClose}>
      <Form method="post" className="flex min-h-0 flex-1 flex-col" onSubmit={() => setSubmittedScope(scope)}>
        {scope.days.map((day) => (
          <input key={day} type="hidden" name="days" value={day} />
        ))}
        {scope.trackIds.map((trackId) => (
          <input key={trackId} type="hidden" name="trackIds" value={trackId} />
        ))}
        <input type="hidden" name="proposalState" value={scope.proposalState} />
        {scope.reset ? <input type="hidden" name="reset" value="on" /> : null}

        <SlideOver.Content className="flex flex-col gap-6">
          <Subtitle>{t('event-management.schedule.autofill.description')}</Subtitle>

          <DaysFilter payload={payload} scope={scope} onChange={setScope} />
          <TracksFilter payload={payload} scope={scope} onChange={setScope} />
          <ProposalStatesFilter payload={payload} scope={scope} onChange={setScope} />
          <RulesSection />
          <ResetToggle scope={scope} onChange={setScope} />
        </SlideOver.Content>

        {displayedReport ? (
          <ReportFooter report={displayedReport} onClose={onClose} />
        ) : (
          <SummaryFooter
            summary={summary}
            scope={scope}
            submitting={navigation.state === 'submitting'}
            onCancel={onClose}
          />
        )}
      </Form>
    </SlideOver>
  );
}

type FilterProps = {
  payload: AutofillPayload;
  scope: AutofillScope;
  onChange: (scope: AutofillScope) => void;
};

const toggle = (values: Array<string>, value: string) =>
  values.includes(value) ? values.filter((v) => v !== value) : [...values, value];

function DaysFilter({ payload, scope, onChange }: FilterProps) {
  const { t, i18n } = useTranslation();

  const allSelected = scope.days.length === payload.days.length;

  return (
    <section className="flex flex-col gap-2">
      <H3>{t('event-management.schedule.autofill.days.heading')}</H3>

      <div className="flex flex-wrap gap-2">
        <DayPill selected={allSelected} onClick={() => onChange({ ...scope, days: allSelected ? [] : payload.days })}>
          {t('event-management.schedule.autofill.days.all')}
        </DayPill>

        {payload.days.map((day) => (
          <DayPill
            key={day}
            selected={scope.days.includes(day)}
            onClick={() => onChange({ ...scope, days: toggle(scope.days, day) })}
          >
            {formatDate(new Date(`${day}T00:00:00.000Z`), { format: 'medium', locale: i18n.language, timezone: 'UTC' })}
          </DayPill>
        ))}
      </div>
    </section>
  );
}

type DayPillProps = { selected: boolean; onClick: VoidFunction; children: React.ReactNode };

function DayPill({ selected, onClick, children }: DayPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx('cursor-pointer rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset', {
        'bg-indigo-600 text-white ring-indigo-600': selected,
        'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50': !selected,
      })}
    >
      {children}
    </button>
  );
}

function TracksFilter({ payload, scope, onChange }: FilterProps) {
  const { t } = useTranslation();

  // What this autofill would fill in that track, whether the track is checked or not.
  const vacancies = useMemo(
    () =>
      new Map(
        payload.tracks.map((track) => [track.id, vacantSessionCount(payload, { ...scope, trackIds: [track.id] })]),
      ),
    [payload, scope],
  );

  return (
    <section className="flex flex-col gap-2">
      <H3>{t('event-management.schedule.autofill.tracks.heading')}</H3>

      <ul className="flex flex-col gap-2">
        {payload.tracks.map((track) => {
          const count = vacancies.get(track.id) ?? 0;
          return (
            <li key={track.id} className="flex items-center justify-between gap-4">
              <Checkbox
                checked={scope.trackIds.includes(track.id)}
                onChange={() => onChange({ ...scope, trackIds: toggle(scope.trackIds, track.id) })}
              >
                {track.name}
              </Checkbox>
              <Subtitle size="xs">
                {count === 0
                  ? t('event-management.schedule.autofill.tracks.none')
                  : t('event-management.schedule.autofill.tracks.vacant', { count })}
              </Subtitle>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const PROPOSAL_STATE_LABELS = {
  all: 'event-management.schedule.autofill.proposal-states.all',
  accepted: 'event-management.schedule.autofill.proposal-states.accepted',
  confirmed: 'event-management.schedule.autofill.proposal-states.confirmed',
} as const satisfies Record<ProposalState, string>;

function ProposalStatesFilter({ payload, scope, onChange }: FilterProps) {
  const { t } = useTranslation();

  // How many proposals are in that state, whatever the days, the tracks and what is already scheduled.
  const counts = useMemo(
    () =>
      new Map(
        PROPOSAL_STATES.map((state) => [
          state,
          payload.proposals.filter((proposal) => isEligibleProposal(proposal, state)).length,
        ]),
      ),
    [payload],
  );

  // Segmented control: the nesting Confirmed ⊆ Accepted ⊆ All is said by the position of the segments.
  return (
    <Fieldset className="flex flex-col gap-2">
      <Legend>
        <H3>{t('event-management.schedule.autofill.proposal-states.heading')}</H3>
      </Legend>

      <RadioGroup
        value={scope.proposalState}
        onChange={(proposalState: ProposalState) => onChange({ ...scope, proposalState })}
        className="flex rounded-md shadow-xs"
      >
        {PROPOSAL_STATES.map((state) => (
          <Radio
            key={state}
            value={state}
            className={({ checked }) =>
              cx(
                'flex-1 cursor-pointer px-3 py-1.5 text-center text-sm font-medium ring-1 ring-inset first:rounded-l-md last:rounded-r-md focus:outline-hidden',
                checked
                  ? 'bg-indigo-600 text-white ring-indigo-600'
                  : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50',
              )
            }
          >
            {`${t(PROPOSAL_STATE_LABELS[state])} (${counts.get(state) ?? 0})`}
          </Radio>
        ))}
      </RadioGroup>
    </Fieldset>
  );
}

// Static, non interactive, and deliberately not derived from ASSIGNMENT_RULES: `Single assignment`
// is structural and would have to be added there as a fake entry, only to be displayed.
const RULE_LABELS = [
  'event-management.schedule.autofill.rules.single-assignment',
  'event-management.schedule.autofill.rules.speaker-overlap',
] as const;

function RulesSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-2">
      <H3>{t('event-management.schedule.autofill.rules.heading')}</H3>

      <ul className="flex flex-col gap-1">
        {RULE_LABELS.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <LockClosedIcon className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
            <Subtitle size="xs">{t(key)}</Subtitle>
          </li>
        ))}
      </ul>
    </section>
  );
}

type ResetProps = { scope: AutofillScope; onChange: (scope: AutofillScope) => void };

function ResetToggle({ scope, onChange }: ResetProps) {
  const { t } = useTranslation();

  return (
    <section className={cx('rounded-md p-3', { 'ring-1 ring-red-500 ring-inset': scope.reset })}>
      <ToggleGroup
        label={t('event-management.schedule.autofill.reset')}
        value={scope.reset}
        onChange={(reset) => onChange({ ...scope, reset })}
      />
    </section>
  );
}

type SummaryFooterProps = {
  summary: AutofillReport;
  scope: AutofillScope;
  submitting: boolean;
  onCancel: VoidFunction;
};

function SummaryFooter({ summary, scope, submitting, onCancel }: SummaryFooterProps) {
  const { t } = useTranslation();

  const filled = summary.assignments.length;
  const cleared = summary.sessionsToClear.length;

  return (
    <footer className="flex shrink-0 flex-col gap-4 border-t border-gray-200 p-4">
      <div>
        <Subtitle size="xs">{t('event-management.schedule.autofill.summary.label')}</Subtitle>
        <Text size="2xl" weight="semibold">
          {t('event-management.schedule.autofill.summary.filled', { count: filled })}
        </Text>
        {summary.sessionsLeftVacant.length > 0 ? (
          <Subtitle size="xs">
            {t('event-management.schedule.autofill.summary.left-vacant', { count: summary.sessionsLeftVacant.length })}
          </Subtitle>
        ) : null}
        {summary.proposalsLeftUnscheduled.length > 0 ? (
          <Subtitle size="xs">
            {t('event-management.schedule.autofill.summary.unplaced', {
              count: summary.proposalsLeftUnscheduled.length,
            })}
          </Subtitle>
        ) : null}
      </div>

      {scope.reset && cleared > 0 ? (
        <Callout variant="error">{t('event-management.schedule.autofill.summary.cleared', { count: cleared })}</Callout>
      ) : null}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={filled === 0} loading={submitting}>
          {t('event-management.schedule.autofill.summary.submit')}
        </Button>
      </div>
    </footer>
  );
}

const REASON_LABELS = {
  'no-vacant-session': 'event-management.schedule.autofill.report.reason.no-vacant-session',
  'speaker-overlap': 'event-management.schedule.autofill.report.reason.speaker-overlap',
} as const satisfies Record<AutofillReason, string>;

function ReportFooter({ report, onClose }: { report: AutofillReport; onClose: VoidFunction }) {
  const { t } = useTranslation();

  // Grouped by reason: a nominative list can run to a hundred entries and helps nobody.
  const byReason = new Map<AutofillReason, number>();
  for (const { reason } of report.proposalsLeftUnscheduled) {
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
  }

  return (
    <footer className="flex shrink-0 flex-col gap-4 border-t border-gray-200 p-4">
      <div>
        <Subtitle size="xs">{t('event-management.schedule.autofill.report.label')}</Subtitle>
        <Text size="2xl" weight="semibold">
          {t('event-management.schedule.autofill.report.filled', { count: report.assignments.length })}
        </Text>
        {report.sessionsLeftVacant.length > 0 ? (
          <Subtitle size="xs">
            {t('event-management.schedule.autofill.report.left-vacant', { count: report.sessionsLeftVacant.length })}
          </Subtitle>
        ) : null}
        {[...byReason].map(([reason, count]) => (
          <Subtitle key={reason} size="xs">
            {t(REASON_LABELS[reason], { count })}
          </Subtitle>
        ))}
        {report.sessionsToClear.length > 0 ? (
          <Subtitle size="xs">
            {t('event-management.schedule.autofill.report.cleared', { count: report.sessionsToClear.length })}
          </Subtitle>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </footer>
  );
}
