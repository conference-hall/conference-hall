import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { SubmissionContextProvider, useSteps, useSubmissionNavigation } from './submission-context.tsx';

describe('SubmissionContext', () => {
  function TestSubmissionContextComponent() {
    const steps = useSteps();
    return steps?.map((step) => (
      <a key={step.key} href={step.path}>
        {step.name}
      </a>
    ));
  }

  it('returns steps for a complete event', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey>
          <TestSubmissionContextComponent />
        </SubmissionContextProvider>
      </I18nextProvider>,
    );

    const links = screen.getByRole('link').all();
    expect(links).toHaveLength(6);

    await expect.element(links[0]).toHaveTextContent('Selection');
    await expect.element(links[0]).toHaveAttribute('href', '/event-1/submission');
    await expect.element(links[1]).toHaveTextContent('Proposal');
    await expect.element(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    await expect.element(links[2]).toHaveTextContent('Speakers');
    await expect.element(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    await expect.element(links[3]).toHaveTextContent('Tracks');
    await expect.element(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/tracks');
    await expect.element(links[4]).toHaveTextContent('Survey');
    await expect.element(links[4]).toHaveAttribute('href', '/event-1/submission/talk-1/survey');
    await expect.element(links[5]).toHaveTextContent('Submission');
    await expect.element(links[5]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });

  it('returns steps for an event without tracks and survey', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks={false} hasSurvey={false}>
          <TestSubmissionContextComponent />
        </SubmissionContextProvider>
      </I18nextProvider>,
    );

    const links = screen.getByRole('link').all();
    expect(links).toHaveLength(4);
    await expect.element(links[0]).toHaveTextContent('Selection');
    await expect.element(links[0]).toHaveAttribute('href', '/event-1/submission');
    await expect.element(links[1]).toHaveTextContent('Proposal');
    await expect.element(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    await expect.element(links[2]).toHaveTextContent('Speakers');
    await expect.element(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    await expect.element(links[3]).toHaveTextContent('Submission');
    await expect.element(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });

  it('returns steps for an event with tracks but without survey', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey={false}>
          <TestSubmissionContextComponent />
        </SubmissionContextProvider>
      </I18nextProvider>,
    );

    const links = screen.getByRole('link').all();
    expect(links).toHaveLength(5);
    await expect.element(links[0]).toHaveTextContent('Selection');
    await expect.element(links[0]).toHaveAttribute('href', '/event-1/submission');
    await expect.element(links[1]).toHaveTextContent('Proposal');
    await expect.element(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    await expect.element(links[2]).toHaveTextContent('Speakers');
    await expect.element(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    await expect.element(links[3]).toHaveTextContent('Tracks');
    await expect.element(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/tracks');
    await expect.element(links[4]).toHaveTextContent('Submission');
    await expect.element(links[4]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });

  it('returns steps for an event without tracks but with survey', async () => {
    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks={false} hasSurvey>
          <TestSubmissionContextComponent />
        </SubmissionContextProvider>
      </I18nextProvider>,
    );

    const links = screen.getByRole('link').all();
    expect(links).toHaveLength(5);
    await expect.element(links[0]).toHaveTextContent('Selection');
    await expect.element(links[0]).toHaveAttribute('href', '/event-1/submission');
    await expect.element(links[1]).toHaveTextContent('Proposal');
    await expect.element(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    await expect.element(links[2]).toHaveTextContent('Speakers');
    await expect.element(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    await expect.element(links[3]).toHaveTextContent('Survey');
    await expect.element(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/survey');
    await expect.element(links[4]).toHaveTextContent('Submission');
    await expect.element(links[4]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });
});

describe('useSubmissionNavigation', () => {
  function TestSubmissionNavigationComponent() {
    const { previousPath, nextPath } = useSubmissionNavigation();
    return (
      <>
        <p>Previous: {previousPath || 'none'}</p>
        <p>Next: {nextPath || 'none'}</p>
      </>
    );
  }

  it('returns first step paths', async () => {
    const path = '/event-1/submission';
    const RouteStub = createRoutesStub([
      {
        path,
        handle: { step: 'selection' },
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SubmissionContextProvider eventSlug="event-1" hasTracks hasSurvey>
              <TestSubmissionNavigationComponent />
            </SubmissionContextProvider>
          </I18nextProvider>
        ),
      },
    ]);

    const screen = render(<RouteStub initialEntries={[path]} />);

    await expect.element(screen.getByText('Previous: none')).toBeInTheDocument();
    await expect.element(screen.getByText('Next: /event-1/submission/new')).toBeInTheDocument();
  });

  it('returns previous and next step paths', async () => {
    const path = '/event-1/submission/talk-1/speakers';
    const RouteStub = createRoutesStub([
      {
        path,
        handle: { step: 'speakers' },
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey>
              <TestSubmissionNavigationComponent />
            </SubmissionContextProvider>
          </I18nextProvider>
        ),
      },
    ]);

    const screen = render(<RouteStub initialEntries={[path]} />);

    await expect.element(screen.getByText('Previous: /event-1/submission/talk-1')).toBeInTheDocument();
    await expect.element(screen.getByText('Next: /event-1/submission/talk-1/tracks')).toBeInTheDocument();
  });

  it('returns last step paths', async () => {
    const path = '/event-1/submission/talk-1/submit';
    const RouteStub = createRoutesStub([
      {
        path,
        handle: { step: 'submission' },
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey>
              <TestSubmissionNavigationComponent />
            </SubmissionContextProvider>
          </I18nextProvider>
        ),
      },
    ]);

    const screen = render(<RouteStub initialEntries={[path]} />);

    await expect.element(screen.getByText('Previous: /event-1/submission/talk-1/survey')).toBeInTheDocument();
    await expect.element(screen.getByText('Next: none')).toBeInTheDocument();
  });
});
