import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { ScheduleTime } from '../../models/schedule-time.ts';
import { DisplayDays } from './display-days.tsx';

const scheduleTime = new ScheduleTime('Europe/Paris');
const scheduleDays = scheduleTime.days(new Date('2024-10-04T22:00:00.000Z'), new Date('2024-10-06T21:59:59.999Z'));

function renderDisplayDays(onChangeDisplayDays: (startIndex: number, endIndex: number) => void) {
  return page.render(
    <I18nextProvider i18n={i18nTest}>
      <DisplayDays
        scheduleTime={scheduleTime}
        scheduleDays={scheduleDays}
        displayedDays={[scheduleDays[0]]}
        onChangeDisplayDays={onChangeDisplayDays}
      />
    </I18nextProvider>,
  );
}

describe('DisplayDays component', () => {
  it('moves to the next schedule day with the next arrow', async () => {
    const onChangeDisplayDays = vi.fn();
    await renderDisplayDays(onChangeDisplayDays);

    await page.getByRole('button', { name: 'Next' }).click();

    expect(onChangeDisplayDays).toHaveBeenCalledWith(1, 1);
  });

  it('selects a schedule day from the date picker', async () => {
    const onChangeDisplayDays = vi.fn();
    await renderDisplayDays(onChangeDisplayDays);

    await page.getByRole('button', { name: 'October 5, 2024' }).click();
    await page.getByLabelText('Start date').fill('2024-10-06');

    expect(onChangeDisplayDays).toHaveBeenCalledWith(1, 1);
  });
});
