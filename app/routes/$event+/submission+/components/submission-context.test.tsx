import { render } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
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

  it('returns steps for a complete event', () => {
    const screen = render(
      <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey>
        <TestSubmissionContextComponent />
      </SubmissionContextProvider>,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(6);
    expect(links[0]).toHaveTextContent('Selection');
    expect(links[0]).toHaveAttribute('href', '/event-1/submission');
    expect(links[1]).toHaveTextContent('Proposal');
    expect(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    expect(links[2]).toHaveTextContent('Speakers');
    expect(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    expect(links[3]).toHaveTextContent('Tracks');
    expect(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/tracks');
    expect(links[4]).toHaveTextContent('Survey');
    expect(links[4]).toHaveAttribute('href', '/event-1/submission/talk-1/survey');
    expect(links[5]).toHaveTextContent('Submission');
    expect(links[5]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });

  it('returns steps for an event without tracks and survey', () => {
    const screen = render(
      <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks={false} hasSurvey={false}>
        <TestSubmissionContextComponent />
      </SubmissionContextProvider>,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveTextContent('Selection');
    expect(links[0]).toHaveAttribute('href', '/event-1/submission');
    expect(links[1]).toHaveTextContent('Proposal');
    expect(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    expect(links[2]).toHaveTextContent('Speakers');
    expect(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    expect(links[3]).toHaveTextContent('Submission');
    expect(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });

  it('returns steps for an event with tracks but without survey', () => {
    const screen = render(
      <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey={false}>
        <TestSubmissionContextComponent />
      </SubmissionContextProvider>,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveTextContent('Selection');
    expect(links[0]).toHaveAttribute('href', '/event-1/submission');
    expect(links[1]).toHaveTextContent('Proposal');
    expect(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    expect(links[2]).toHaveTextContent('Speakers');
    expect(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    expect(links[3]).toHaveTextContent('Tracks');
    expect(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/tracks');
    expect(links[4]).toHaveTextContent('Submission');
    expect(links[4]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
  });

  it('returns steps for an event without tracks but with survey', () => {
    const screen = render(
      <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks={false} hasSurvey>
        <TestSubmissionContextComponent />
      </SubmissionContextProvider>,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveTextContent('Selection');
    expect(links[0]).toHaveAttribute('href', '/event-1/submission');
    expect(links[1]).toHaveTextContent('Proposal');
    expect(links[1]).toHaveAttribute('href', '/event-1/submission/talk-1');
    expect(links[2]).toHaveTextContent('Speakers');
    expect(links[2]).toHaveAttribute('href', '/event-1/submission/talk-1/speakers');
    expect(links[3]).toHaveTextContent('Survey');
    expect(links[3]).toHaveAttribute('href', '/event-1/submission/talk-1/survey');
    expect(links[4]).toHaveTextContent('Submission');
    expect(links[4]).toHaveAttribute('href', '/event-1/submission/talk-1/submit');
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

  it('returns first step paths', () => {
    const path = '/event-1/submission';
    const RouteStub = createRoutesStub([
      {
        path,
        handle: { step: 'selection' },
        Component: () => (
          <SubmissionContextProvider eventSlug="event-1" hasTracks hasSurvey>
            <TestSubmissionNavigationComponent />
          </SubmissionContextProvider>
        ),
      },
    ]);

    const screen = render(<RouteStub initialEntries={[path]} />);

    expect(screen.getByText('Previous: none')).toBeInTheDocument();
    expect(screen.getByText('Next: /event-1/submission/new')).toBeInTheDocument();
  });

  it('returns previous and next step paths', () => {
    const path = '/event-1/submission/talk-1/speakers';
    const RouteStub = createRoutesStub([
      {
        path,
        handle: { step: 'speakers' },
        Component: () => (
          <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey>
            <TestSubmissionNavigationComponent />
          </SubmissionContextProvider>
        ),
      },
    ]);

    const screen = render(<RouteStub initialEntries={[path]} />);

    expect(screen.getByText('Previous: /event-1/submission/talk-1')).toBeInTheDocument();
    expect(screen.getByText('Next: /event-1/submission/talk-1/tracks')).toBeInTheDocument();
  });

  it('returns last step paths', () => {
    const path = '/event-1/submission/talk-1/submit';
    const RouteStub = createRoutesStub([
      {
        path,
        handle: { step: 'submission' },
        Component: () => (
          <SubmissionContextProvider eventSlug="event-1" talkId="talk-1" hasTracks hasSurvey>
            <TestSubmissionNavigationComponent />
          </SubmissionContextProvider>
        ),
      },
    ]);

    const screen = render(<RouteStub initialEntries={[path]} />);

    expect(screen.getByText('Previous: /event-1/submission/talk-1/survey')).toBeInTheDocument();
    expect(screen.getByText('Next: none')).toBeInTheDocument();
  });
});
