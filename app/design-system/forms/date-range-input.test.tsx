import { page } from 'vitest/browser';
import { DateRangeInput } from './date-range-input.tsx';

describe('DateRangeInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    start: { name: 'start-date', label: 'Start Date', value: null },
    end: { name: 'end-date', label: 'End Date', value: null },
    timezone: 'UTC',
  };

  it('renders start and end date inputs', async () => {
    await page.render(<DateRangeInput {...defaultProps} />);

    await expect.element(page.getByLabelText('Start Date')).toBeInTheDocument();
    await expect.element(page.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('initializes with provided date values', async () => {
    const startDate = new Date('2023-01-15');
    const endDate = new Date('2023-01-20');

    await page.render(
      <DateRangeInput
        start={{ name: 'start-date', label: 'Start Date', value: startDate }}
        end={{ name: 'end-date', label: 'End Date', value: endDate }}
        timezone="UTC"
      />,
    );

    const startInput = page.getByLabelText('Start Date');
    const endInput = page.getByLabelText('End Date');

    await expect.element(startInput).toHaveValue('2023-01-15');
    await expect.element(endInput).toHaveValue('2023-01-20');
  });

  it('initializes with provided date values and specific timezone', async () => {
    const startDate = new Date('2023-01-15');
    const endDate = new Date('2023-01-20');

    await page.render(
      <DateRangeInput
        start={{ name: 'start-date', label: 'Start Date', value: startDate }}
        end={{ name: 'end-date', label: 'End Date', value: endDate }}
        timezone="America/New_York"
      />,
    );

    const startInput = page.getByLabelText('Start Date');
    const endInput = page.getByLabelText('End Date');

    await expect.element(startInput).toHaveValue('2023-01-14');
    await expect.element(endInput).toHaveValue('2023-01-19');
  });

  it('shows error message when provided', async () => {
    const errorMessage = ['Invalid date range'];

    await page.render(<DateRangeInput {...defaultProps} error={errorMessage} />);

    await expect.element(page.getByText('Invalid date range')).toBeInTheDocument();
  });

  it('calls onChange when provided', async () => {
    const mockOnChange = vi.fn();

    await page.render(<DateRangeInput {...defaultProps} onChange={mockOnChange} />);

    const startInput = page.getByLabelText('Start Date');
    const endInput = page.getByLabelText('End Date');

    await startInput.fill('2023-01-12');
    expect(mockOnChange).toHaveBeenCalledWith(new Date('2023-01-12'), new Date('2023-01-12'));
    await expect.element(endInput).toHaveAttribute('min', '2023-01-12');
    mockOnChange.mockClear();

    await endInput.fill('2023-01-18');
    expect(mockOnChange).toHaveBeenCalledWith(new Date('2023-01-12'), new Date('2023-01-18'));
    mockOnChange.mockClear();
  });

  it('respects min and max date constraints', async () => {
    const minDate = new Date('2023-01-05');
    const maxDate = new Date('2023-01-25');

    await page.render(<DateRangeInput {...defaultProps} min={minDate} max={maxDate} />);

    const startInput = page.getByLabelText('Start Date');
    const endInput = page.getByLabelText('End Date');

    await expect.element(startInput).toHaveAttribute('min', '2023-01-05');
    await expect.element(startInput).toHaveAttribute('max', '2023-01-25');
    await expect.element(endInput).toHaveAttribute('max', '2023-01-25');
  });
});
