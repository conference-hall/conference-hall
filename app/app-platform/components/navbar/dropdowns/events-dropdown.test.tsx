import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { EventsDropdown } from './events-dropdown.tsx';

const mockTeams = [
  {
    slug: 'team-1',
    name: 'Team 1',
    role: 'OWNER' as const,
    events: [
      { slug: 'event-1', name: 'Event 1', logoUrl: null, archived: false },
      { slug: 'event-2', name: 'Event 2', logoUrl: 'https://example.com/logo.jpg', archived: false },
      { slug: 'event-3', name: 'Event 3', logoUrl: null, archived: true },
    ],
  },
  {
    slug: 'team-2',
    name: 'Team 2',
    role: 'MEMBER' as const,
    events: [{ slug: 'event-4', name: 'Event 4', logoUrl: null, archived: false }],
  },
];

describe('EventsDropdown component', () => {
  const renderComponent = (Component: JSX.Element, initialEntries = ['/team/team-1/event-1']) => {
    const RouteStub = createRoutesStub([
      { path: '/team/:team/:event/*', Component: () => Component },
      { path: '/team/:team/:event', Component: () => Component },
    ]);
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <RouteStub initialEntries={initialEntries} />
      </I18nextProvider>,
    );
  };

  it('displays current event name in dropdown button', async () => {
    await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

    const dropdownButton = page.getByRole('button');
    await expect.element(dropdownButton).toHaveTextContent('Event 1');
  });

  it('opens dropdown menu and generates correct navigation links for events', async () => {
    await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

    const dropdownButton = page.getByRole('button');
    await dropdownButton.click();

    const eventLink1 = page.getByRole('menuitem', { name: /Event 1/ });
    const eventLink2 = page.getByRole('menuitem', { name: /Event 2/ });

    await expect.element(eventLink1).toHaveAttribute('href', '/team/team-1/event-1');
    await expect.element(eventLink2).toHaveAttribute('href', '/team/team-1/event-2');
  });

  describe('Event filtering', () => {
    it('filters out archived events by default', async () => {
      await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

      const dropdownButton = page.getByRole('button');
      await dropdownButton.click();

      const eventLink1 = page.getByRole('menuitem', { name: /Event 1/ });
      const eventLink2 = page.getByRole('menuitem', { name: /Event 2/ });
      await expect.element(eventLink1).toBeInTheDocument();
      await expect.element(eventLink2).toBeInTheDocument();

      const archivedEvent = page.getByRole('menuitem', { name: /Event 3/ });
      await expect.element(archivedEvent).not.toBeInTheDocument();
    });

    it('shows archived event if it is the current event', async () => {
      await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-3']);

      const dropdownButton = page.getByRole('button');
      await expect.element(dropdownButton).toHaveTextContent('Event 3');
      await dropdownButton.click();

      const archivedCurrentEvent = page.getByRole('menuitem', { name: /Event 3/ });
      await expect.element(archivedCurrentEvent).toBeInTheDocument();
    });

    it('only shows events from current team', async () => {
      await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

      const dropdownButton = page.getByRole('button');
      await dropdownButton.click();

      const event1 = page.getByRole('menuitem', { name: /Event 1/ });
      const event2 = page.getByRole('menuitem', { name: /Event 2/ });
      await expect.element(event1).toBeInTheDocument();
      await expect.element(event2).toBeInTheDocument();

      const otherTeamEvent = page.getByRole('menuitem', { name: /Event 4/ });
      await expect.element(otherTeamEvent).not.toBeInTheDocument();
    });
  });

  describe('Event creation from menu', () => {
    it('shows event creation when user has the permission', async () => {
      await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-1/event-1']);

      const dropdownButton = page.getByRole('button');
      await dropdownButton.click();

      const newEventLink = page.getByRole('menuitem', { name: /New event/ });
      await expect.element(newEventLink).toBeInTheDocument();
    });

    it('hides event creation when user has not the permission', async () => {
      await renderComponent(<EventsDropdown teams={mockTeams} />, ['/team/team-2/event-4']);

      const dropdownButton = page.getByRole('button');
      await dropdownButton.click();

      const newEventLink = page.getByRole('menuitem', { name: /New event/ });
      await expect.element(newEventLink).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles team with no events', async () => {
      const teamsWithNoEvents = [{ slug: 'empty-team', name: 'Empty Team', role: 'OWNER' as const, events: [] }];

      await renderComponent(<EventsDropdown teams={teamsWithNoEvents} />, ['/team/empty-team/event-1']);

      const button = page.getByRole('button');
      await expect.element(button).not.toBeInTheDocument();
    });
  });
});
