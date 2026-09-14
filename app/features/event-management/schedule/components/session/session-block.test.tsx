import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { ScheduleProviders } from '../../context/schedule-context.test-helpers.tsx';
import { ScheduleTime } from '../../models/schedule-time.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SessionBlock } from './session-block.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');
const day = scheduleTime.fromUtc(new Date('2024-10-05T07:00:00.000Z'));
const hourLater = scheduleTime.fromUtc(new Date('2024-10-05T08:00:00.000Z'));

const START_TIME = scheduleTime.formatTime(day, 'en');
const END_TIME = scheduleTime.formatTime(hourLater, 'en');

const session: ScheduleSession = {
  id: 'session-1',
  trackId: 'track-1',
  timeslot: { start: day, end: hourLater },
  name: 'Coffee break',
  language: null,
  color: 'stone',
  emojis: [],
  proposal: null,
};

const talk: ScheduleSession = {
  ...session,
  name: null,
  proposal: {
    id: 'proposal-1',
    routeId: 'route-1',
    title: 'Deep dive into CSS',
    speakers: [{ name: 'Ada Lovelace', picture: null }],
  },
};

function renderInSchedule(children: ReactNode) {
  return page.render(
    <I18nextProvider i18n={i18nTest}>
      <ScheduleProviders scheduleTime={scheduleTime} scheduleDays={[day]} displayedDays={[day]}>
        {children}
      </ScheduleProviders>
    </I18nextProvider>,
  );
}

function renderInContainer(height: number, children: ReactNode) {
  return renderInSchedule(
    <div style={{ containerName: 'session', containerType: 'size', height: `${height}px`, width: '240px' }}>
      {children}
    </div>,
  );
}

function renderBlock() {
  const onOpen = vi.fn();
  const rendered = renderInContainer(64, <SessionBlock session={session} onOpen={onOpen} />);
  return { rendered, onOpen };
}

function renderAtHeight(height: number) {
  return renderInContainer(height, <SessionBlock session={talk} onOpen={() => {}} />);
}

describe('SessionBlock component', () => {
  describe('what a block shows at each height', () => {
    it('shows nothing but its colour, and stays clickable, under 8 pixels', async () => {
      await renderAtHeight(8);

      await expect.element(page.getByRole('button')).toBeVisible();
      await expect.element(page.getByText('Deep dive into CSS')).not.toBeVisible();
      await expect.element(page.getByText(START_TIME)).not.toBeVisible();
    });

    it('shows the title and the start time at 20 pixels', async () => {
      await renderAtHeight(20);

      await expect.element(page.getByRole('button')).toBeVisible();
      await expect.element(page.getByText('Deep dive into CSS')).toBeVisible();
      await expect.element(page.getByText(START_TIME)).toBeVisible();
      await expect.element(page.getByText('Ada Lovelace')).not.toBeVisible();
      await expect.element(page.getByText(END_TIME)).not.toBeVisible();
    });

    it('adds the speakers at 32 pixels', async () => {
      await renderAtHeight(32);

      await expect.element(page.getByRole('button')).toBeVisible();
      await expect.element(page.getByText('Deep dive into CSS')).toBeVisible();
      await expect.element(page.getByText('Ada Lovelace')).toBeVisible();
      await expect.element(page.getByText(START_TIME)).toBeVisible();
      await expect.element(page.getByText(END_TIME)).not.toBeVisible();
    });

    it('adds the end time at 48 pixels', async () => {
      await renderAtHeight(48);

      await expect.element(page.getByRole('button')).toBeVisible();
      await expect.element(page.getByText('Deep dive into CSS')).toBeVisible();
      await expect.element(page.getByText('Ada Lovelace')).toBeVisible();
      await expect.element(page.getByText(START_TIME)).toBeVisible();
      await expect.element(page.getByText(END_TIME)).toBeVisible();
    });

    it('shows everything untruncated at 64 pixels', async () => {
      await renderAtHeight(64);

      await expect.element(page.getByRole('button')).toBeVisible();
      await expect.element(page.getByText('Deep dive into CSS')).toBeVisible();
      await expect.element(page.getByText('Ada Lovelace')).toBeVisible();
      await expect.element(page.getByText(START_TIME)).toBeVisible();
      await expect.element(page.getByText(END_TIME)).toBeVisible();
    });
  });

  it('asks to open the session with Enter', async () => {
    const { rendered, onOpen } = renderBlock();
    await rendered;

    await userEvent.tab();
    await expect.element(page.getByRole('button', { name: /Coffee break/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalled();
  });

  it('asks to open the session with Space', async () => {
    const { rendered, onOpen } = renderBlock();
    await rendered;

    await userEvent.tab();
    await expect.element(page.getByRole('button', { name: /Coffee break/ })).toHaveFocus();
    await userEvent.keyboard(' ');

    expect(onOpen).toHaveBeenCalled();
  });

  it('asks to open the session on click', async () => {
    const { rendered, onOpen } = renderBlock();
    await rendered;

    await page.getByRole('button', { name: /Coffee break/ }).click();

    expect(onOpen).toHaveBeenCalled();
  });
});
