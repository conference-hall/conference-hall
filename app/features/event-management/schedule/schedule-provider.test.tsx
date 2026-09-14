import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import type { ScheduleData } from './components/schedule.types.ts';
import { useCurrentSchedule, useScheduleSessions } from './schedule-context.tsx';
import { ScheduleProvider } from './schedule-provider.tsx';

const schedule: ScheduleData = {
  timezone: 'Europe/Paris',
  start: new Date('2024-10-04T22:00:00.000Z'),
  end: new Date('2024-10-05T21:59:59.999Z'),
  displayStartMinutes: 9 * 60,
  displayEndMinutes: 18 * 60,
  tracks: [{ id: 'track-1', name: 'Room 1' }],
  sessions: [
    {
      id: 'session-1',
      trackId: 'track-1',
      start: new Date('2024-10-05T08:00:00.000Z'),
      end: new Date('2024-10-05T09:00:00.000Z'),
      name: 'Break',
      language: null,
      color: 'stone',
      emojis: [],
      proposal: null,
    },
  ],
};

const seamRender = vi.fn();

function SeamSpy() {
  const { displayedTimes, onChangeDisplayTimes } = useCurrentSchedule();
  seamRender();
  return (
    <>
      <p>
        Times: {displayedTimes.start}-{displayedTimes.end}
      </p>
      <button type="button" onClick={() => onChangeDisplayTimes(10 * 60, 17 * 60)}>
        Change times
      </button>
    </>
  );
}

function SessionsSpy() {
  const sessions = useScheduleSessions();
  const { updateSession, onOpenSession } = useCurrentSchedule();
  return (
    <>
      <p>Sessions: {sessions.map((session) => session.name).join(', ')}</p>
      <button type="button" onClick={() => updateSession({ ...sessions[0], name: 'Renamed' })}>
        Rename first
      </button>
      <button type="button" onClick={() => onOpenSession(sessions[0])}>
        Open first
      </button>
    </>
  );
}

const stableConsumers = (
  <>
    <SeamSpy />
    <SessionsSpy />
  </>
);

async function renderProvider() {
  const RouteStub = createRoutesStub([
    {
      path: '/team/:team/:event/schedule/:day',
      action: () => new Promise(() => {}),
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <ScheduleProvider schedule={schedule}>{stableConsumers}</ScheduleProvider>
        </I18nextProvider>
      ),
    },
    { path: '/team/:team/:event/autocomplete', loader: () => [] },
  ]);

  await page.render(<RouteStub initialEntries={['/team/t1/e1/schedule/0']} />);
  await expect.element(page.getByText('Sessions: Break')).toBeVisible();
  seamRender.mockClear();
}

describe('ScheduleProvider', () => {
  it('changes the drawn sessions on a mutation without re-rendering the seam', async () => {
    await renderProvider();

    await page.getByRole('button', { name: 'Rename first' }).click();

    await expect.element(page.getByText('Sessions: Renamed')).toBeVisible();
    expect(seamRender).not.toHaveBeenCalled();
  });

  it('re-renders the seam with the new value on a display change', async () => {
    await renderProvider();

    await page.getByRole('button', { name: 'Change times' }).click();

    await expect.element(page.getByText('Times: 600-1020')).toBeVisible();
    expect(seamRender).toHaveBeenCalledTimes(1);
  });

  it('opens the session modal without re-rendering the seam', async () => {
    await renderProvider();

    await page.getByRole('button', { name: 'Open first' }).click();

    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
    await expect.element(page.getByRole('combobox', { name: 'Session name' })).toHaveValue('Break');
    expect(seamRender).not.toHaveBeenCalled();
  });
});
