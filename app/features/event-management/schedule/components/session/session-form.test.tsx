import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { setMinutesFromStartOfDay } from '~/shared/datetimes/datetimes.ts';
import { buildCurrentSchedule } from '../../context/schedule-context.test-helpers.ts';
import { type CurrentSchedule, CurrentScheduleProvider } from '../../context/schedule-context.tsx';
import { ScheduleTime } from '../../models/schedule-time.ts';
import type { PlacementOutcome } from '../../models/session-placement.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SessionForm } from './session-form.tsx';

const scheduleDays = [new Date(2024, 9, 5), new Date(2024, 9, 6)];
const displayedTimes = { start: 9 * 60, end: 18 * 60 };

const timeslot = {
  start: setMinutesFromStartOfDay(scheduleDays[0], 10 * 60),
  end: setMinutesFromStartOfDay(scheduleDays[0], 10 * 60 + 30),
};

const session: ScheduleSession = {
  id: 'session-1',
  trackId: 'track-1',
  timeslot,
  name: 'Coffee break',
  language: null,
  color: 'stone',
  emojis: [],
  proposal: null,
};

const placed: PlacementOutcome = { status: 'placed', placement: { trackId: 'track-1', timeslot } };
const conflict: PlacementOutcome = {
  status: 'conflict',
  conflictingSession: { id: 'session-2', trackId: 'track-1', timeslot },
};

function renderForm(mode: 'create' | 'edit', overrides: Partial<CurrentSchedule> = {}) {
  const addSession = vi.fn<CurrentSchedule['addSession']>(async () => placed);
  const updateSession = vi.fn<CurrentSchedule['updateSession']>(async () => placed);
  const deleteSession = vi.fn<CurrentSchedule['deleteSession']>(async () => {});
  const onFinish = vi.fn();

  const currentSchedule = buildCurrentSchedule({
    scheduleTime: new ScheduleTime('America/New_York'),
    tracks: [
      { id: 'track-1', name: 'Room 1' },
      { id: 'track-2', name: 'Room 2' },
    ],
    scheduleDays,
    displayedDays: scheduleDays,
    displayedTimes,
    addSession,
    updateSession,
    deleteSession,
    ...overrides,
  });

  const RouteStub = createRoutesStub([
    {
      path: '/team/:team/:event/schedule',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <CurrentScheduleProvider value={currentSchedule}>
            <SessionForm mode={mode} session={session} onFinish={onFinish} />
          </CurrentScheduleProvider>
        </I18nextProvider>
      ),
    },
    { path: '/team/:team/:event/autocomplete', loader: () => [] },
  ]);

  const rendered = page.render(<RouteStub initialEntries={['/team/t1/e1/schedule']} />);
  return { rendered, addSession, updateSession, deleteSession, onFinish };
}

function optionsOf(select: ReturnType<typeof page.getByLabelText>) {
  return Array.from(select.element().querySelectorAll('option')).map((option) => option.textContent);
}

describe('SessionForm component', () => {
  it('creates a session with the schedule mutation', async () => {
    const { rendered, addSession, onFinish } = renderForm('create');
    await rendered;

    await page.getByRole('combobox', { name: 'Session name' }).fill('Keynote');
    await userEvent.keyboard('{Enter}');
    await userEvent.selectOptions(page.getByLabelText('Track'), 'track-2');
    await page.getByLabelText('Date').fill('2024-10-06');
    await userEvent.selectOptions(page.getByLabelText('From'), String(11 * 60));
    await userEvent.selectOptions(page.getByLabelText('Language'), 'en');
    await page.getByRole('radio', { name: 'Blue' }).click();
    await page.getByRole('button', { name: 'Choose an emoji' }).click();
    await page.getByRole('button', { name: 'Rocket' }).click();

    await page.getByRole('button', { name: 'Create session' }).click();

    expect(addSession).toHaveBeenCalledWith({
      ...session,
      name: 'Keynote',
      trackId: 'track-2',
      timeslot: {
        start: setMinutesFromStartOfDay(scheduleDays[1], 11 * 60),
        end: setMinutesFromStartOfDay(scheduleDays[1], 11 * 60 + 30),
      },
      language: 'en',
      color: 'blue',
      emojis: ['rocket'],
    });
    expect(onFinish).toHaveBeenCalled();
  });

  it('updates a session with the schedule mutation', async () => {
    const { rendered, updateSession, onFinish } = renderForm('edit');
    await rendered;

    await userEvent.selectOptions(page.getByLabelText('Track'), 'track-2');
    await userEvent.selectOptions(page.getByLabelText('From'), String(11 * 60));

    await page.getByRole('button', { name: 'Save session' }).click();

    expect(updateSession).toHaveBeenCalledWith({
      ...session,
      trackId: 'track-2',
      timeslot: {
        start: setMinutesFromStartOfDay(scheduleDays[0], 11 * 60),
        end: setMinutesFromStartOfDay(scheduleDays[0], 11 * 60 + 30),
      },
    });
    expect(onFinish).toHaveBeenCalled();
  });

  it('deletes a session in edit mode', async () => {
    const { rendered, deleteSession, onFinish } = renderForm('edit');
    await rendered;

    await page.getByRole('button', { name: 'Remove' }).click();

    expect(deleteSession).toHaveBeenCalledWith(session);
    expect(onFinish).toHaveBeenCalled();
  });

  it('does not offer to delete in create mode', async () => {
    const { rendered } = renderForm('create');
    await rendered;

    await expect.element(page.getByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('keeps the form open and shows the conflict returned by the mutation', async () => {
    const { rendered, onFinish } = renderForm('edit', { updateSession: async () => conflict });
    await rendered;

    await page.getByRole('button', { name: 'Save session' }).click();

    await expect
      .element(page.getByRole('alert'))
      .toHaveTextContent(
        'This session overlaps with an existing session on the same track. Please choose a different time slot.',
      );
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('offers the tracks, the schedule days and the displayed times of the schedule', async () => {
    const { rendered } = renderForm('edit');
    await rendered;

    expect(optionsOf(page.getByLabelText('Track'))).toEqual(['Room 1', 'Room 2']);

    const date = page.getByLabelText('Date');
    await expect.element(date).toHaveAttribute('min', '2024-10-05');
    await expect.element(date).toHaveAttribute('max', '2024-10-06');

    const fromOptions = optionsOf(page.getByLabelText('From'));
    expect(fromOptions.at(0)).toBe('09:00');
    expect(fromOptions.at(-1)).toBe('18:55');
  });

  it('finishes without mutation on cancel', async () => {
    const { rendered, addSession, updateSession, deleteSession, onFinish } = renderForm('edit');
    await rendered;

    await page.getByRole('button', { name: 'Cancel' }).click();

    expect(addSession).not.toHaveBeenCalled();
    expect(updateSession).not.toHaveBeenCalled();
    expect(deleteSession).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
  });
});
