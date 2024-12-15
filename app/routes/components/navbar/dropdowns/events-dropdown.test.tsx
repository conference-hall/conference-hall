import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';

import type { JSX } from 'react';
import { EventsDropdown } from './events-dropdown.tsx';

describe('EventsDropdown component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/', Component: () => Component }]);
    render(<RouteStub />);
  };

  const events = [
    { slug: 'event-1', name: 'Event 1', logoUrl: null, archived: false },
    { slug: 'event-2', name: 'Event 2', logoUrl: null, archived: false },
    { slug: 'event-3', name: 'Event 3', logoUrl: null, archived: true },
  ];

  it('displays and opens the dropdown', async () => {
    const currentTeam = { slug: 'team-1', name: 'Team 1' };
    const currentEvent = { slug: 'event-1', name: 'Event 1', logoUrl: null };

    renderComponent(<EventsDropdown events={events} currentTeam={currentTeam} currentEvent={currentEvent} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Event 1');

    await userEvent.click(button);

    const eventLink1 = screen.getByRole('menuitem', { name: /Event 1/ });
    expect(eventLink1).toHaveAttribute('href', '/team/team-1/event-1');

    const eventLink2 = screen.getByRole('menuitem', { name: /Event 2/ });
    expect(eventLink2).toHaveAttribute('href', '/team/team-1/event-2');

    const eventLink3 = screen.queryByRole('menuitem', { name: /Event 3/ });
    expect(eventLink3).toBeNull();
  });

  it('displays an archived event if it is the current one', async () => {
    const currentTeam = { slug: 'team-1', name: 'Team 1' };
    const currentEvent = { slug: 'event-3', name: 'Event 3', logoUrl: null };

    renderComponent(<EventsDropdown events={events} currentTeam={currentTeam} currentEvent={currentEvent} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Event 3');
  });
});
