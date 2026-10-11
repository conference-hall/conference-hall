import { Fieldset, Legend, Radio, RadioGroup } from '@headlessui/react';
import { LockClosedIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Toggle, ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { H3, Subtitle, Text } from '~/design-system/typography.tsx';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import {
  type AutofillPayload,
  type AutofillReason,
  type SpeakerRestMinutes,
  type AutofillReport,
  type AutofillScope,
  type ProposalState,
  PROPOSAL_STATES,
  SPEAKER_REST_MINUTES,
  autofill,
  isEligibleProposal,
  proposalsWithoutFormatDuration,
} from '../../models/autofill.ts';

type Props = { payload: AutofillPayload; report: AutofillReport | null; onClose: VoidFunction };

export function AutofillPanel({ payload, report, onClose }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [scope, setScope] = useState<AutofillScope>(() => ({
    days: payload.days,
    trackIds: payload.tracks.map((track) => track.id),
    proposalState: 'accepted',
    reset: true,
    rules: { formatDuration: true, speakerRest: DEFAULT_SPEAKER_REST },
  }));

  const [submittedScope, setSubmittedScope] = useState<AutofillScope | null>(null);
  const displayedReport = submittedScope === scope ? report : null;
  const summary = useMemo(() => autofill(payload, scope), [payload, scope]);

  if (payload.sessions.length === 0) {
    return (
      <SlideOver open title={t('event-management.schedule.autofill.heading')} size="l" onClose={onClose}>
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
    <SlideOver open title={t('event-management.schedule.autofill.heading')} size="l" onClose={onClose}>
      <Form method="post" className="flex min-h-0 flex-1 flex-col" onSubmit={() => setSubmittedScope(scope)}>
        {scope.days.map((day) => (
          <input key={day} type="hidden" name="days" value={day} />
        ))}
        {scope.trackIds.map((trackId) => (
          <input key={trackId} type="hidden" name="trackIds" value={trackId} />
        ))}
        <input type="hidden" name="proposalState" value={scope.proposalState} />
        {scope.reset ? <input type="hidden" name="reset" value="on" /> : null}
        {scope.rules.formatDuration ? <input type="hidden" name="formatDuration" value="on" /> : null}
        {scope.rules.speakerRest ? <input type="hidden" name="speakerRest" value={scope.rules.speakerRest} /> : null}

        <SlideOver.Content className="flex flex-col gap-6">
          <DaysFilter payload={payload} scope={scope} onChange={setScope} />
          <TracksFilter payload={payload} scope={scope} onChange={setScope} />
          <ProposalStatesFilter payload={payload} scope={scope} onChange={setScope} />
          <RulesSection scope={scope} onChange={setScope} />
          <div className="flex min-h-14 flex-col justify-center rounded-md border px-3 py-2">
            <ToggleGroup
              label={t('event-management.schedule.autofill.reset')}
              value={scope.reset}
              onChange={(reset) => setScope({ ...scope, reset })}
            />
          </div>
        </SlideOver.Content>

        {displayedReport ? (
          <ReportFooter report={displayedReport} onClose={onClose} />
        ) : (
          <SummaryFooter
            payload={payload}
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

  return (
    <section className="flex flex-col gap-2">
      <H3 weight="medium">{t('event-management.schedule.autofill.days.heading')}</H3>

      <div className="flex flex-wrap gap-2">
        {payload.days.map((day) => (
          <SelectionPill
            key={day}
            selected={scope.days.includes(day)}
            onClick={() => onChange({ ...scope, days: toggle(scope.days, day) })}
          >
            {formatDate(new Date(`${day}T00:00:00.000Z`), { format: 'medium', locale: i18n.language, timezone: 'UTC' })}
          </SelectionPill>
        ))}
      </div>
    </section>
  );
}

function TracksFilter({ payload, scope, onChange }: FilterProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-2">
      <H3 weight="medium">{t('event-management.schedule.autofill.tracks.heading')}</H3>

      <div className="flex flex-wrap gap-2">
        {payload.tracks.map((track) => (
          <SelectionPill
            key={track.id}
            selected={scope.trackIds.includes(track.id)}
            onClick={() => onChange({ ...scope, trackIds: toggle(scope.trackIds, track.id) })}
          >
            {track.name}
          </SelectionPill>
        ))}
      </div>
    </section>
  );
}

type SelectionPillProps = { selected: boolean; onClick: VoidFunction; children: React.ReactNode };

function SelectionPill({ selected, onClick, children }: SelectionPillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx('cursor-pointer rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset', {
        'bg-slate-200 text-slate-700 ring-slate-200': selected,
        'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50': !selected,
      })}
    >
      {children}
    </button>
  );
}

const PROPOSAL_STATE_LABELS = {
  all: 'event-management.schedule.autofill.proposal-states.all',
  accepted: 'event-management.schedule.autofill.proposal-states.accepted',
  confirmed: 'event-management.schedule.autofill.proposal-states.confirmed',
} as const satisfies Record<ProposalState, string>;

function ProposalStatesFilter({ payload, scope, onChange }: FilterProps) {
  const { t } = useTranslation();

  const counts = new Map(
    PROPOSAL_STATES.map((state) => [
      state,
      payload.proposals.filter((proposal) => isEligibleProposal(proposal, state)).length,
    ]),
  );

  return (
    <Fieldset className="flex flex-col gap-2">
      <Legend>
        <H3 weight="medium">{t('event-management.schedule.autofill.proposal-states.heading')}</H3>
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
                  ? 'bg-slate-200 text-slate-700 ring-slate-200'
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

const FIXED_RULE_LABELS = [
  'event-management.schedule.autofill.rules.single-assignment',
  'event-management.schedule.autofill.rules.speaker-overlap',
] as const;

const DEFAULT_SPEAKER_REST = 30;

const formatMinutes = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${minutes / 60} h`);

function RulesSection({ scope, onChange }: Pick<FilterProps, 'scope' | 'onChange'>) {
  const { t } = useTranslation();
  const [speakerRest, setSpeakerRest] = useState<SpeakerRestMinutes>(DEFAULT_SPEAKER_REST);
  const speakerRestEnabled = scope.rules.speakerRest !== null;

  return (
    <section className="flex flex-col gap-2">
      <H3 weight="medium">{t('event-management.schedule.autofill.rules.heading')}</H3>

      <ul className="flex flex-col divide-y rounded-md border">
        {FIXED_RULE_LABELS.map((key) => (
          <li key={key} className="flex min-h-14 items-center justify-between gap-4 px-3 py-2">
            <Subtitle size="xs">{t(key)}</Subtitle>
            <LockClosedIcon className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
          </li>
        ))}
        <li className="flex min-h-14 items-center justify-between gap-4 px-3 py-2">
          <Subtitle size="xs">{t('event-management.schedule.autofill.rules.format-duration')}</Subtitle>
          <Toggle
            label={t('event-management.schedule.autofill.rules.format-duration')}
            value={scope.rules.formatDuration}
            onChange={(formatDuration) => onChange({ ...scope, rules: { ...scope.rules, formatDuration } })}
          />
        </li>
        <li className="flex min-h-14 items-center justify-between gap-4 px-3 py-2">
          <span className={cx('flex flex-wrap items-center gap-1.5', { 'text-gray-400': !speakerRestEnabled })}>
            <Subtitle size="xs">{t('event-management.schedule.autofill.rules.speaker-rest.before')}</Subtitle>
            <select
              aria-label={t('event-management.schedule.autofill.rules.speaker-rest.duration')}
              value={speakerRest}
              disabled={!speakerRestEnabled}
              onChange={(event) => {
                const minutes = SPEAKER_REST_MINUTES.find((value) => String(value) === event.target.value);
                if (!minutes) return;
                setSpeakerRest(minutes);
                onChange({ ...scope, rules: { ...scope.rules, speakerRest: minutes } });
              }}
              className="rounded-md border-0 py-0.5 pr-8 pl-2 text-sm ring-1 ring-gray-300 ring-inset disabled:bg-gray-50"
            >
              {SPEAKER_REST_MINUTES.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {formatMinutes(minutes)}
                </option>
              ))}
            </select>
            <Subtitle size="xs">{t('event-management.schedule.autofill.rules.speaker-rest.after')}</Subtitle>
          </span>
          <Toggle
            label={t('event-management.schedule.autofill.rules.speaker-rest.label')}
            value={speakerRestEnabled}
            onChange={(on) => onChange({ ...scope, rules: { ...scope.rules, speakerRest: on ? speakerRest : null } })}
          />
        </li>
      </ul>
    </section>
  );
}

type SummaryFooterProps = {
  payload: AutofillPayload;
  summary: AutofillReport;
  scope: AutofillScope;
  submitting: boolean;
  onCancel: VoidFunction;
};

function SummaryFooter({ payload, summary, scope, submitting, onCancel }: SummaryFooterProps) {
  const { t } = useTranslation();

  const unknownDurations = scope.rules.formatDuration
    ? proposalsWithoutFormatDuration(payload, scope.proposalState)
    : 0;

  const filled = summary.assignments.length;
  const cleared = summary.sessionsToClear.length;

  return (
    <footer className="flex shrink-0 flex-col gap-4 p-4">
      <Callout title={t('event-management.schedule.autofill.summary.label')}>
        <ul>
          <li>{t('event-management.schedule.autofill.summary.filled', { count: filled })}</li>
          {scope.reset && cleared > 0 ? (
            <li>{t('event-management.schedule.autofill.summary.cleared', { count: cleared })}</li>
          ) : null}
          {summary.sessionsLeftVacant.length > 0 ? (
            <li>
              {t('event-management.schedule.autofill.summary.left-vacant', {
                count: summary.sessionsLeftVacant.length,
              })}
            </li>
          ) : null}
          {summary.proposalsLeftUnscheduled.length > 0 ? (
            <li>
              <span>
                {t('event-management.schedule.autofill.summary.unplaced', {
                  count: summary.proposalsLeftUnscheduled.length,
                })}
              </span>
              <ReasonList proposals={summary.proposalsLeftUnscheduled} />
            </li>
          ) : null}
          {unknownDurations > 0 ? (
            <li>{t('event-management.schedule.autofill.summary.unknown-durations', { count: unknownDurations })}</li>
          ) : null}
        </ul>
      </Callout>

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
  'format-duration': 'event-management.schedule.autofill.report.reason.format-duration',
  'speaker-rest': 'event-management.schedule.autofill.report.reason.speaker-rest',
} as const satisfies Record<AutofillReason, string>;

function ReasonList({ proposals }: { proposals: AutofillReport['proposalsLeftUnscheduled'] }) {
  const { t } = useTranslation();

  const byReason = new Map<AutofillReason, number>();
  for (const { reason } of proposals) {
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
  }

  return (
    <ul className="ml-4 list-disc">
      {[...byReason].map(([reason, count]) => (
        <li key={reason}>{t(REASON_LABELS[reason], { count })}</li>
      ))}
    </ul>
  );
}

function ReportFooter({ report, onClose }: { report: AutofillReport; onClose: VoidFunction }) {
  const { t } = useTranslation();

  return (
    <footer className="flex shrink-0 flex-col gap-4 p-4">
      <Callout title={t('event-management.schedule.autofill.report.label')} variant="success">
        <ul>
          <li>{t('event-management.schedule.autofill.report.filled', { count: report.assignments.length })}</li>
          {report.sessionsLeftVacant.length > 0 ? (
            <li>
              {t('event-management.schedule.autofill.report.left-vacant', { count: report.sessionsLeftVacant.length })}
            </li>
          ) : null}
          {report.proposalsLeftUnscheduled.length > 0 ? (
            <li>
              <span>
                {t('event-management.schedule.autofill.report.unplaced', {
                  count: report.proposalsLeftUnscheduled.length,
                })}
              </span>
              <ReasonList proposals={report.proposalsLeftUnscheduled} />
            </li>
          ) : null}
          {report.sessionsToClear.length > 0 ? (
            <li>{t('event-management.schedule.autofill.report.cleared', { count: report.sessionsToClear.length })}</li>
          ) : null}
        </ul>
      </Callout>

      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </footer>
  );
}
