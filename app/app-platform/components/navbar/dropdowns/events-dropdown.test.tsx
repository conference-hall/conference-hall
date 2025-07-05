import { userEvent } from '@vitest/browser/context';
import type { JSX } from 'react';
import { createRoutesStub } from 'react-router';
import { render } from 'vitest-browser-react';
import { EventsDropdown } from './events-dropdown.tsx';

describe('EventsDropdown component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/', Component: () => Component }]);
    return render(<RouteStub />);
  };

  const events = [
    { slug: 'event-1', name: 'Event 1', logoUrl: null, archived: false },
    { slug: 'event-2', name: 'Event 2', logoUrl: null, archived: false },
    { slug: 'event-3', name: 'Event 3', logoUrl: null, archived: true },
  ];

  it('displays and opens the dropdown', async () => {
    const currentTeam = { slug: 'team-1', name: 'Team 1' };
    const currentEvent = { slug: 'event-1', name: 'Event 1', logoUrl: null };

    const screen = renderComponent(
      <EventsDropdown events={events} currentTeam={currentTeam} currentEvent={currentEvent} />,
    );

    const button = screen.getByRole('button');
    await expect.element(button).toHaveTextContent('Event 1');

    await userEvent.click(button);

    const eventLink1 = screen.getByRole('menuitem', { name: /Event 1/ });
    await expect.element(eventLink1).toHaveAttribute('href', '/team/team-1/event-1');

    const eventLink2 = screen.getByRole('menuitem', { name: /Event 2/ });
    await expect.element(eventLink2).toHaveAttribute('href', '/team/team-1/event-2');

    const eventLink3 = screen.getByRole('menuitem', { name: /Event 3/ });
    await expect.element(eventLink3).not.toBeInTheDocument();
  });

  it('displays an archived event if it is the current one', async () => {
    const currentTeam = { slug: 'team-1', name: 'Team 1' };
    const currentEvent = { slug: 'event-3', name: 'Event 3', logoUrl: null };

    const screen = renderComponent(
      <EventsDropdown events={events} currentTeam={currentTeam} currentEvent={currentEvent} />,
    );

    const button = screen.getByRole('button');
    await expect.element(button).toHaveTextContent('Event 3');
  });
});
