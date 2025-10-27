import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import {
  CallForPaperDateLabel,
  CallForPaperElapsedTimeLabel,
  CallForPaperStatusLabel,
  cfpColorStatus,
} from './cfp.tsx';

describe('cfpColorStatus function', () => {
  it('returns "disabled" when both dates are null', () => {
    expect(cfpColorStatus('OPENED', null, null)).toBe('disabled');
    expect(cfpColorStatus('CLOSED', null, null)).toBe('disabled');
    expect(cfpColorStatus('FINISHED', null, null)).toBe('disabled');
  });

  it('returns "success" for OPENED state when dates are provided', () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    expect(cfpColorStatus('OPENED', startDate, endDate)).toBe('success');
  });

  it('returns "warning" for CLOSED state when dates are provided', () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    expect(cfpColorStatus('CLOSED', startDate, endDate)).toBe('warning');
  });

  it('returns "error" for FINISHED state when dates are provided', () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    expect(cfpColorStatus('FINISHED', startDate, endDate)).toBe('error');
  });

  it('uses state when only one date is provided', () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    expect(cfpColorStatus('OPENED', startDate, null)).toBe('success');
    expect(cfpColorStatus('CLOSED', null, endDate)).toBe('warning');
  });
});

describe('CallForPaperStatusLabel component', () => {
  const renderComponent = (state: 'OPENED' | 'CLOSED' | 'FINISHED', start: Date | null, end: Date | null) => {
    return render(
      <I18nextProvider i18n={i18nTest}>
        <CallForPaperStatusLabel state={state} start={start} end={end} />
      </I18nextProvider>,
    );
  };

  it('displays disabled status when start and end dates are null', async () => {
    const screen = await renderComponent('OPENED', null, null);

    // Should display the disabled message regardless of state
    await expect.element(screen.getByText('Call for papers is disabled')).toBeInTheDocument();
  });

  it('displays opened status when state is OPENED', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('OPENED', startDate, endDate);

    await expect.element(screen.getByText('Call for papers open')).toBeInTheDocument();
  });

  it('displays closed status when state is CLOSED', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('CLOSED', startDate, endDate);

    await expect.element(screen.getByText('Opening soon')).toBeInTheDocument();
  });

  it('displays finished status when state is FINISHED', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('FINISHED', startDate, endDate);

    await expect.element(screen.getByText('Call for papers closed')).toBeInTheDocument();
  });

  it('displays opened status when only start date is provided', async () => {
    const startDate = new Date('2023-01-01');

    const screen = await renderComponent('OPENED', startDate, null);

    await expect.element(screen.getByText('Call for papers open')).toBeInTheDocument();
  });

  it('displays opened status when only end date is provided', async () => {
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('OPENED', null, endDate);

    await expect.element(screen.getByText('Call for papers open')).toBeInTheDocument();
  });
});

describe('CallForPaperElapsedTimeLabel component', () => {
  const renderComponent = (state: 'OPENED' | 'CLOSED' | 'FINISHED', start: Date, end: Date) => {
    return render(
      <I18nextProvider i18n={i18nTest}>
        <CallForPaperElapsedTimeLabel state={state} start={start} end={end} />
      </I18nextProvider>,
    );
  };

  beforeEach(() => {
    // Set a fixed date for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('displays closed elapsed time for CLOSED state', async () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('CLOSED', startDate, endDate);

    expect(screen.container.textContent).toMatch(/The call for papers will open/);
  });

  it('displays opened elapsed time for OPENED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 2);

    const screen = await renderComponent('OPENED', startDate, endDate);

    expect(screen.container.textContent).toBe('Call for papers open');
  });
  it('displays finished message for FINISHED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('FINISHED', startDate, endDate);

    expect(screen.container.textContent).toBe('Call for papers closed');
  });

  it('displays time information for OPENED state with upcoming deadline', async () => {
    const startDate = new Date('2022-12-01'); // started 1 month ago
    const endDate = new Date('2023-02-01'); // ends in 1 month

    const screen = await renderComponent('OPENED', startDate, endDate);

    expect(screen.container.textContent).toBe('Call for papers open');
  });

  it('displays time information for CLOSED state with future start date', async () => {
    const startDate = new Date('2023-02-01'); // starts in 1 month
    const endDate = new Date('2023-03-01'); // ends in 2 months

    const screen = await renderComponent('CLOSED', startDate, endDate);

    expect(screen.container.textContent).toMatch(/The call for papers will open/);
    expect(screen.container.textContent).toMatch(/next month/);
  });

  it('displays closed message for FINISHED state with past end date', async () => {
    const startDate = new Date('2022-11-01'); // started 2 months ago
    const endDate = new Date('2022-12-01'); // ended 1 month ago

    const screen = await renderComponent('FINISHED', startDate, endDate);

    expect(screen.container.textContent).toBe('Call for papers closed');
  });
});

describe('CallForPaperDateLabel component', () => {
  const renderComponent = (
    state: 'OPENED' | 'CLOSED' | 'FINISHED',
    start: Date | null,
    end: Date | null,
    timezone = 'Europe/Paris',
    format?: 'short' | 'long',
  ) => {
    return render(
      <I18nextProvider i18n={i18nTest}>
        <CallForPaperDateLabel state={state} start={start} end={end} timezone={timezone} format={format} />
      </I18nextProvider>,
    );
  };

  it('returns null when start date is null', async () => {
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('OPENED', null, endDate);

    await expect.element(screen.container).toBeEmptyDOMElement();
  });

  it('returns null when end date is null', async () => {
    const startDate = new Date('2023-01-01');

    const screen = await renderComponent('OPENED', startDate, null);

    await expect.element(screen.container).toBeEmptyDOMElement();
  });

  it('displays date label for CLOSED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('CLOSED', startDate, endDate);

    expect(screen.container.textContent).toContain('Open on');
  });

  it('displays date label for OPENED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('OPENED', startDate, endDate);

    expect(screen.container.textContent).toContain('Until');
  });

  it('displays date label for FINISHED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('FINISHED', startDate, endDate);

    expect(screen.container.textContent).toContain('Since');
  });
  it('formats the date according to the format prop', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const longFormatScreen = await renderComponent('OPENED', startDate, endDate, 'Europe/Paris', 'long');
    const shortFormatScreen = await renderComponent('OPENED', startDate, endDate, 'Europe/Paris', 'short');

    const longText = longFormatScreen.container.textContent || '';
    expect(longText).toContain('Until');
    expect(longText).toMatch(/December 31, 2023/);

    const shortText = shortFormatScreen.container.textContent || '';
    expect(shortText).toContain('Until');
    expect(shortText).toMatch(/12\/31\/2023/);

    expect(longFormatScreen.container.textContent).not.toEqual(shortFormatScreen.container.textContent);
  });

  it('displays formatted start date for CLOSED state', async () => {
    const startDate = new Date('2023-02-01');
    const endDate = new Date('2023-03-01');

    const screen = await renderComponent('CLOSED', startDate, endDate);

    const text = screen.container.textContent || '';
    expect(text).toContain('Open on');
    expect(text).toContain('February');
  });

  it('displays formatted end date for OPENED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('OPENED', startDate, endDate);

    const text = screen.container.textContent || '';
    expect(text).toContain('Until');
    expect(text).toContain('December');
  });

  it('displays formatted end date for FINISHED state', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('FINISHED', startDate, endDate);

    const text = screen.container.textContent || '';
    expect(text).toContain('Since');
    expect(text).toContain('December');
  });

  it('uses short format when specified', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');

    const screen = await renderComponent('OPENED', startDate, endDate, 'Europe/Paris', 'short');

    expect(screen.container.textContent).toBeTruthy();
    const text = screen.container.textContent || '';
    expect(text).toContain('12/31');
  });
  it('uses specified timezone for date formatting', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const customTimezone = 'America/New_York';

    const screen = await renderComponent('OPENED', startDate, endDate, customTimezone);
    const text = screen.container.textContent || '';

    expect(text).toMatch(/^Until /);
    expect(text).toContain('EST');

    // Compare with Europe/Paris timezone
    const parisScreen = await renderComponent('OPENED', startDate, endDate, 'Europe/Paris');
    const parisText = parisScreen.container.textContent || '';

    expect(parisText).toMatch(/GMT|CET/);
    expect(text).not.toEqual(parisText);
  });
});
