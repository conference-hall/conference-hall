import { I18nextProvider } from 'react-i18next';
import { createRoutesStub, useActionData } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import type { AutofillPayload, AutofillReport } from '../../models/autofill.ts';
import { AutofillPanel } from './autofill-panel.tsx';

const DAY_1 = '2024-10-05';
const DAY_2 = '2024-10-06';

const at = (day: string, hour: number) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00.000Z`);

const session = (
  id: string,
  { day = DAY_1, trackId = 'track-1', hour = 9, name = null as string | null, proposalId = null as string | null },
) => ({
  id,
  day,
  trackId,
  start: at(day, hour),
  end: at(day, hour + 1),
  name,
  proposalId,
  speakerIds: proposalId ? ['zoe'] : [],
});

const PAYLOAD: AutofillPayload = {
  days: [DAY_1, DAY_2],
  tracks: [
    { id: 'track-1', name: 'Room 1' },
    { id: 'track-2', name: 'Room 2' },
  ],
  sessions: [
    session('session-1', { day: DAY_1, trackId: 'track-1', hour: 9 }),
    session('session-2', { day: DAY_1, trackId: 'track-2', hour: 9 }),
    session('session-3', { day: DAY_2, trackId: 'track-1', hour: 9 }),
    session('session-4', { day: DAY_1, trackId: 'track-1', hour: 11, proposalId: 'proposal-5' }),
    session('session-5', { day: DAY_1, trackId: 'track-1', hour: 14, name: 'Lunch break' }),
  ],
  proposals: [
    {
      id: 'proposal-1',
      number: 1,
      speakerIds: ['alice'],
      deliberationStatus: 'ACCEPTED',
      confirmationStatus: 'PENDING',
      isDraft: false,
      archivedAt: null,
    },
    {
      id: 'proposal-2',
      number: 2,
      speakerIds: ['bob'],
      deliberationStatus: 'ACCEPTED',
      confirmationStatus: 'PENDING',
      isDraft: false,
      archivedAt: null,
    },
    {
      id: 'proposal-3',
      number: 3,
      speakerIds: ['carol'],
      deliberationStatus: 'ACCEPTED',
      confirmationStatus: 'CONFIRMED',
      isDraft: false,
      archivedAt: null,
    },
    {
      id: 'proposal-4',
      number: 4,
      speakerIds: ['dave'],
      deliberationStatus: 'PENDING',
      confirmationStatus: null,
      isDraft: false,
      archivedAt: null,
    },
    {
      id: 'proposal-5',
      number: 5,
      speakerIds: ['zoe'],
      deliberationStatus: 'ACCEPTED',
      confirmationStatus: 'PENDING',
      isDraft: false,
      archivedAt: null,
    },
  ],
};

const REPORT: AutofillReport = {
  assignments: [
    { sessionId: 'session-1', proposalId: 'proposal-1' },
    { sessionId: 'session-2', proposalId: 'proposal-2' },
    { sessionId: 'session-3', proposalId: 'proposal-3' },
  ],
  sessionsLeftVacant: ['session-6'],
  proposalsLeftUnscheduled: [
    { proposalId: 'proposal-7', reason: 'speaker-overlap' },
    { proposalId: 'proposal-8', reason: 'speaker-overlap' },
    { proposalId: 'proposal-9', reason: 'no-vacant-session' },
  ],
  sessionsToClear: [],
};

describe('AutofillPanel component', () => {
  const renderPanel = (options: { payload?: AutofillPayload; report?: AutofillReport } = {}) => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async ({ request }) => {
          const form = await request.formData();
          onSubmit({
            days: form.getAll('days'),
            trackIds: form.getAll('trackIds'),
            proposalState: form.get('proposalState'),
            reset: form.get('reset'),
          });
          return { report: options.report ?? REPORT };
        },
        Component: () => {
          const actionData = useActionData() as { report: AutofillReport } | undefined;
          return (
            <I18nextProvider i18n={i18nTest}>
              <AutofillPanel
                payload={options.payload ?? PAYLOAD}
                report={actionData?.report ?? null}
                onClose={onClose}
              />
            </I18nextProvider>
          );
        },
      },
    ]);

    page.render(<RouteStub />);
    return { onClose, onSubmit };
  };

  it('opens with every day, every track and the accepted proposals selected', async () => {
    renderPanel();

    await expect.element(page.getByRole('button', { name: 'Oct 5, 2024' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('button', { name: 'Oct 6, 2024' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('button', { name: 'Room 1' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('button', { name: 'Room 2' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByRole('radio', { name: 'Accepted (4)' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows the counts of proposals behind each state', async () => {
    renderPanel();

    await expect.element(page.getByRole('radio', { name: 'All (5)' })).toBeVisible();
    await expect.element(page.getByRole('radio', { name: 'Accepted (4)' })).toBeVisible();
    await expect.element(page.getByRole('radio', { name: 'Confirmed (1)' })).toBeVisible();
  });

  it('shows the summary of what the autofill would write', async () => {
    renderPanel();

    await expect.element(page.getByText('Summary')).toBeVisible();
    await expect.element(page.getByText('3 sessions will be filled')).toBeVisible();
    await expect.element(page.getByText('sessions will stay empty')).not.toBeInTheDocument();
    await expect.element(page.getByText('proposals will not be placed')).not.toBeInTheDocument();
  });

  it('recomputes the summary when a day is unchecked', async () => {
    renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Oct 6, 2024' }));

    await expect.element(page.getByText('2 sessions will be filled')).toBeVisible();
  });

  it('recomputes the summary when the proposal state changes', async () => {
    renderPanel();

    await userEvent.click(page.getByRole('radio', { name: 'Confirmed (1)' }));

    await expect.element(page.getByText('1 session will be filled')).toBeVisible();
    await expect.element(page.getByText('2 sessions will stay empty')).toBeVisible();
  });

  it('gives a zero summary and disables the submit when no day is selected', async () => {
    renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Oct 5, 2024' }));
    await userEvent.click(page.getByRole('button', { name: 'Oct 6, 2024' }));

    await expect.element(page.getByText('0 sessions will be filled')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Fill the sessions' })).toBeDisabled();
  });

  it('raises the number of sessions to fill with the reset', async () => {
    renderPanel();

    await expect.element(page.getByText('3 sessions will be filled')).toBeVisible();

    await userEvent.click(page.getByRole('switch'));

    await expect.element(page.getByText('4 sessions will be filled')).toBeVisible();
  });

  it('warns with the number of sessions the reset would clear', async () => {
    renderPanel();

    await expect.element(page.getByText('filled session will be cleared')).not.toBeInTheDocument();

    await userEvent.click(page.getByRole('switch'));

    await expect.element(page.getByText('1 filled session will be cleared')).toBeVisible();
  });

  it('unselects a track and selects it back', async () => {
    renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Room 2' }));
    await expect.element(page.getByRole('button', { name: 'Room 2' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(page.getByRole('button', { name: 'Room 2' }));
    await expect.element(page.getByRole('button', { name: 'Room 2' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('submits the scope shown on screen', async () => {
    const { onSubmit } = renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Oct 6, 2024' }));
    await userEvent.click(page.getByRole('button', { name: 'Room 2' }));
    await userEvent.click(page.getByRole('radio', { name: 'All (5)' }));
    await userEvent.click(page.getByRole('switch'));
    await userEvent.click(page.getByRole('button', { name: 'Fill the sessions' }));

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        days: [DAY_1],
        trackIds: ['track-1'],
        proposalState: 'all',
        reset: 'on',
      }),
    );
  });

  it('switches to the autofill result once executed, with the reasons grouped', async () => {
    renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Fill the sessions' }));

    await expect.element(page.getByText('Autofill result')).toBeVisible();
    await expect.element(page.getByText('3 sessions filled')).toBeVisible();
    await expect.element(page.getByText('1 session left empty')).toBeVisible();
    await expect.element(page.getByText('2 proposals set aside: speaker already busy')).toBeVisible();
    await expect.element(page.getByText('1 proposal without a free session')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Fill the sessions' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Close' }).last()).toBeVisible();
  });

  it('brings the summary back when a filter is touched after the execution', async () => {
    renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Fill the sessions' }));
    await expect.element(page.getByText('Autofill result')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Oct 6, 2024' }));

    await expect.element(page.getByText('Summary')).toBeVisible();
    await expect.element(page.getByText('2 sessions will be filled')).toBeVisible();
  });

  it('shows a zero autofill as a plain result', async () => {
    const report: AutofillReport = {
      assignments: [],
      sessionsLeftVacant: ['session-1'],
      proposalsLeftUnscheduled: [{ proposalId: 'proposal-1', reason: 'no-vacant-session' }],
      sessionsToClear: [],
    };
    renderPanel({ report });

    await userEvent.click(page.getByRole('button', { name: 'Fill the sessions' }));

    await expect.element(page.getByText('0 sessions filled')).toBeVisible();
    await expect.element(page.getByText('1 proposal without a free session')).toBeVisible();
  });

  it('shows how many sessions the reset has cleared', async () => {
    const report: AutofillReport = { ...REPORT, sessionsToClear: ['session-4', 'session-5'] };
    renderPanel({ report });

    await userEvent.click(page.getByRole('button', { name: 'Fill the sessions' }));

    await expect.element(page.getByText('2 sessions cleared')).toBeVisible();
  });

  it('invites to create sessions when the schedule has none', async () => {
    const { onClose } = renderPanel({ payload: { ...PAYLOAD, sessions: [] } });

    await expect.element(page.getByText('No session in the schedule')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Fill the sessions' })).not.toBeInTheDocument();

    await userEvent.click(page.getByRole('button', { name: 'Close' }).last());

    expect(onClose).toHaveBeenCalled();
  });

  it('closes without writing on cancel', async () => {
    const { onClose, onSubmit } = renderPanel();

    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
