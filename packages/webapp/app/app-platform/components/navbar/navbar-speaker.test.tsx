import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { UserProvider } from '../user-context.tsx';
import { NavbarSpeaker } from './navbar-speaker.tsx';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  teams: [],
  hasTeamAccess: false,
  notificationsUnreadCount: 1,
};

describe('NavbarSpeaker component', () => {
  const renderComponent = (user: typeof mockUser | null, initialEntries = ['/speaker']) => {
    const RouteStub = createRoutesStub([
      { path: '/speaker', Component: () => <NavbarSpeaker /> },
      { path: '/speaker/talks', Component: () => <NavbarSpeaker /> },
      { path: '/speaker/talks/new', Component: () => <NavbarSpeaker /> },
      { path: '/speaker/talks/:id', Component: () => <NavbarSpeaker /> },
      { path: '/speaker/settings/*', Component: () => <NavbarSpeaker /> },
      { path: '/notifications', Component: () => <NavbarSpeaker /> },
    ]);
    return render(
      <I18nextProvider i18n={i18nTest}>
        <UserProvider user={user}>
          <RouteStub initialEntries={initialEntries} />
        </UserProvider>
      </I18nextProvider>,
    );
  };

  it('renders logo and user menu when user is authenticated', async () => {
    const screen = await renderComponent(mockUser);

    const logo = screen.getByRole('link', { name: 'Go to Home' });
    await expect.element(logo).toBeInTheDocument();
    await expect.element(logo).toHaveAttribute('href', '/');

    const userMenuButton = screen.getByRole('button', { name: 'Open user menu' });
    await expect.element(userMenuButton).toBeInTheDocument();
  });

  it('renders login button when user is not authenticated', async () => {
    const screen = await renderComponent(null);

    const loginButton = screen.getByRole('link', { name: 'Login' });
    await expect.element(loginButton).toBeInTheDocument();
  });

  it('opens user menu when clicked', async () => {
    const screen = await renderComponent(mockUser);

    const userMenuButton = screen.getByRole('button', { name: 'Open user menu' });
    await userEvent.click(userMenuButton);

    await expect.element(screen.getByRole('link', { name: 'Activity' })).toBeInTheDocument();
    await expect.element(screen.getByRole('link', { name: 'Talks library' })).toBeInTheDocument();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });
});
