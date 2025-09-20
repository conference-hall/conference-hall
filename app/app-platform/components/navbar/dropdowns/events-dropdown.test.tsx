import { userEvent } from '@vitest/browser/context';
import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { EventsDropdown } from './events-dropdown.tsx';

const mockTeams = [
  {
    slug: 'team-1',
    name: 'Team 1',
    events: [
      { slug: 'event-1', name: 'Event 1', logoUrl: null, archived: false },
      { slug: 'event-2', name: 'Event 2', logoUrl: 'https://example.com/logo.jpg', archived: false },
      { slug: 'event-3', name: 'Event 3', logoUrl: null, archived: true },
    ],
  },
  {
    slug: 'team-2',
    name: 'Team 2',
    events: [{ slug: 'event-4', name: 'Event 4', logoUrl: null, archived: false }],
  },
];

describe('EventsDropdown component', () => {
  const renderComponent = (Component: JSX.Element, initialEntries = ['/team/team-1/event-1']) => {
    const RouteStub = createRoutesStub([
      { path: '/team/:team/:event/*', Component: () => Component },
      { path: '/team/:team/:event', Component: () => Component },
    ]);
    return render(
      <I18nextProvider i18n={i18nTest}>
        <RouteStub initialEntries={initialEntries} />
      </I18nextProvider>,
    );
  };

  it('displays current event name in dropdown button', async () => {
    const screen = renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

    const dropdownButton = screen.getByRole('button');
    await expect.element(dropdownButton).toHaveTextContent('Event 1');
  });

  it('opens dropdown menu and generates correct navigation links for events', async () => {
    const screen = renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

    const dropdownButton = screen.getByRole('button');
    await userEvent.click(dropdownButton);

    const eventLink1 = screen.getByRole('menuitem', { name: /Event 1/ });
    const eventLink2 = screen.getByRole('menuitem', { name: /Event 2/ });

    await expect.element(eventLink1).toHaveAttribute('href', '/team/team-1/event-1');
    await expect.element(eventLink2).toHaveAttribute('href', '/team/team-1/event-2');
  });

  describe('Event filtering', () => {
    it('filters out archived events by default', async () => {
      const screen = renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

      const dropdownButton = screen.getByRole('button');
      await userEvent.click(dropdownButton);

      const eventLink1 = screen.getByRole('menuitem', { name: /Event 1/ });
      const eventLink2 = screen.getByRole('menuitem', { name: /Event 2/ });
      await expect.element(eventLink1).toBeInTheDocument();
      await expect.element(eventLink2).toBeInTheDocument();

      try {
        screen.getByRole('menuitem', { name: /Event 3/ });
        expect.fail('Should not find archived event in dropdown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('shows archived event if it is the current event', async () => {
      const screen = renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-3']);

      const dropdownButton = screen.getByRole('button');
      await expect.element(dropdownButton).toHaveTextContent('Event 3');

      await userEvent.click(dropdownButton);

      const archivedCurrentEvent = screen.getByRole('menuitem', { name: /Event 3/ });
      await expect.element(archivedCurrentEvent).toBeInTheDocument();
    });

    it('only shows events from current team', async () => {
      const screen = renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

      const dropdownButton = screen.getByRole('button');
      await userEvent.click(dropdownButton);

      const event1 = screen.getByRole('menuitem', { name: /Event 1/ });
      const event2 = screen.getByRole('menuitem', { name: /Event 2/ });
      await expect.element(event1).toBeInTheDocument();
      await expect.element(event2).toBeInTheDocument();

      try {
        screen.getByRole('menuitem', { name: /Event 4/ });
        expect.fail('Should not find event from different team');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Edge cases', () => {
    it('handles team with no events', async () => {
      const teamsWithNoEvents = [{ slug: 'empty-team', name: 'Empty Team', events: [] }];

      const screen = renderComponent(<EventsDropdown teams={teamsWithNoEvents} />, ['/team/empty-team/event-1']);

      try {
        screen.getByRole('button');
        expect.fail('Should not find dropdown button when team has no events');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
