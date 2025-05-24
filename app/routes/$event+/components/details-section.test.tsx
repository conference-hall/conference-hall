import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { DetailsSection } from './details-section.tsx';

describe('DetailsSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    description: 'Test description',
    websiteUrl: null,
    contactEmail: null,
    codeOfConductUrl: null,
    conferenceStart: null,
    conferenceEnd: null,
    onlineEvent: false,
    location: null,
    type: 'CONFERENCE' as const,
    timezone: 'Europe/Paris',
  };

  test('renders conference type correctly', () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} />
      </I18nextProvider>,
    );

    expect(screen.getByText('Conference')).toBeInTheDocument();
  });

  test('renders meetup type correctly', () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} type="MEETUP" />
      </I18nextProvider>,
    );

    expect(screen.getByText('Meetup')).toBeInTheDocument();
  });

  test('renders description markdown', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} description="**Bold text**" />
      </I18nextProvider>,
    );

    const boldElement = screen.getByText('Bold text');
    await expect.element(boldElement).toBeInTheDocument();
    await expect(boldElement.element().tagName.toLowerCase()).toBe('strong');
  });

  test('renders location when provided', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} location="Paris, France" />
      </I18nextProvider>,
    );

    const locationText = screen.getByText('Paris, France');
    await expect.element(locationText).toBeInTheDocument();
  });

  test('renders online event info when onlineEvent is true', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} onlineEvent={true} />
      </I18nextProvider>,
    );

    const onlineText = screen.getByText('Online');
    await expect.element(onlineText).toBeInTheDocument();
  });

  test('renders conference dates when on the same day', async () => {
    const conferenceStart = new Date('2023-03-15T09:00:00');
    const conferenceEnd = new Date('2023-03-15T18:00:00');

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} conferenceStart={conferenceStart} conferenceEnd={conferenceEnd} />
      </I18nextProvider>,
    );

    const dateText = screen.getByText(/March 15, 2023/);
    await expect.element(dateText).toBeInTheDocument();
  });

  test('renders conference dates when spanning multiple days', async () => {
    const conferenceStart = new Date('2023-03-15T09:00:00');
    const conferenceEnd = new Date('2023-03-17T18:00:00');

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} conferenceStart={conferenceStart} conferenceEnd={conferenceEnd} />
      </I18nextProvider>,
    );

    await expect.element(screen.getByText(/Mar 15 - March 17, 2023/)).toBeInTheDocument();
  });

  test('renders website link when provided', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} websiteUrl="https://example.com" />
      </I18nextProvider>,
    );

    const link = await screen.getByRole('link', { name: 'Website' });
    await expect.element(link).toHaveAttribute('href', 'https://example.com');
  });

  test('renders contact email link when provided', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} contactEmail="contact@example.com" />
      </I18nextProvider>,
    );

    const link = await screen.getByRole('link', { name: 'Contact' });
    await expect.element(link).toHaveAttribute('href', 'mailto:contact@example.com');
  });

  test('renders code of conduct link when provided', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection {...defaultProps} codeOfConductUrl="https://example.com/coc" />
      </I18nextProvider>,
    );

    const link = await screen.getByRole('link', { name: 'Code of Conduct' });
    await expect.element(link).toHaveAttribute('href', 'https://example.com/coc');
  });

  test('renders all links when provided', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <DetailsSection
          {...defaultProps}
          websiteUrl="https://example.com"
          contactEmail="contact@example.com"
          codeOfConductUrl="https://example.com/coc"
        />
      </I18nextProvider>,
    );

    await expect.element(screen.getByRole('link', { name: 'Website' })).toBeInTheDocument();
    await expect.element(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    await expect.element(screen.getByRole('link', { name: 'Code of Conduct' })).toBeInTheDocument();
  });
});
