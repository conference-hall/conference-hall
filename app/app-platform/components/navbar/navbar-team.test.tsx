import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import type { AuthenticatedUser } from '~/shared/types/user.types.ts';
import { UserProvider } from '../user-context.tsx';
import { NavbarTeam } from './navbar-team.tsx';

const mockUser: AuthenticatedUser = {
  id: 'user-1',
  uid: 'user-uid-1',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  teams: [
    {
      slug: 'team-1',
      name: 'Team 1',
      role: 'OWNER',
      events: [
        { slug: 'event-1', name: 'Event 1', logoUrl: null, archived: false },
        { slug: 'event-2', name: 'Event 2', logoUrl: null, archived: false },
      ],
    },
  ],
  hasTeamAccess: true,
  notificationsUnreadCount: 2,
};

describe('NavbarTeam component', () => {
  const renderComponent = (user: typeof mockUser | null, initialEntries = ['/team/team-1']) => {
    const RouteStub = createRoutesStub([
      { path: '/team/:team', Component: () => <NavbarTeam />, id: 'team-management' },
      { path: '/team/:team/:event', Component: () => <NavbarTeam />, id: 'event-management' },
      { path: '/team/:team/:event/overview', Component: () => <NavbarTeam /> },
      { path: '/*', Component: () => <NavbarTeam /> },
    ]);
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <UserProvider user={user}>
          <RouteStub initialEntries={initialEntries} />
        </UserProvider>
      </I18nextProvider>,
    );
  };

  it('renders logo and user menu when user is authenticated', async () => {
    await renderComponent(mockUser);

    const logo = page.getByRole('link', { name: 'Go to Home' });
    await expect.element(logo).toBeInTheDocument();

    const userMenuButton = page.getByRole('button', { name: 'Open user menu' });
    await expect.element(userMenuButton).toBeInTheDocument();
  });

  it('displays teams dropdown when user has teams', async () => {
    await renderComponent(mockUser);

    const teamsDropdown = page.getByRole('button', { name: /Team 1/ });
    await expect.element(teamsDropdown).toBeInTheDocument();
  });

  it('displays events dropdown when in event context', async () => {
    await renderComponent(mockUser, ['/team/team-1/event-1']);

    const eventsDropdown = page.getByRole('button', { name: /Event 1/ });
    await expect.element(eventsDropdown).toBeInTheDocument();
  });

  it('opens user menu when clicked', async () => {
    await renderComponent(mockUser);

    const userMenuButton = page.getByRole('button', { name: 'Open user menu' });
    await userMenuButton.click();

    await expect.element(page.getByText('Activity')).toBeInTheDocument();
    await expect.element(page.getByText('Talks library')).toBeInTheDocument();
  });
});
