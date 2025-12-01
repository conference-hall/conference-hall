import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { UserProvider } from '../user-context.tsx';
import { NavbarEvent } from './navbar-event.tsx';

const mockUser = {
  id: 'user-1',
  uid: 'user-uid-1',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  teams: [],
  hasTeamAccess: false,
  notificationsUnreadCount: 0,
};

describe('NavbarEvent component', () => {
  const renderComponent = (user: typeof mockUser | null, initialEntries = ['/conference-2024']) => {
    const RouteStub = createRoutesStub([
      { path: '/:event', Component: () => <NavbarEvent />, id: 'event-page' },
      { path: '/:event/survey', Component: () => <NavbarEvent /> },
      { path: '/:event/proposals', Component: () => <NavbarEvent /> },
      { path: '/:event/submission/*', Component: () => <NavbarEvent /> },
      { path: '/:event/proposals/:id', Component: () => <NavbarEvent /> },
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
    await expect.element(logo).toHaveAttribute('href', '/');

    const userMenuButton = page.getByRole('button', { name: 'Open user menu' });
    await expect.element(userMenuButton).toBeInTheDocument();
  });

  it('renders login button when user is not authenticated', async () => {
    await renderComponent(null);

    const loginButton = page.getByRole('link', { name: 'Login' });
    await expect.element(loginButton).toBeInTheDocument();
  });

  it('displays full logo with label on desktop', async () => {
    await renderComponent(mockUser);

    const logo = page.getByRole('link', { name: 'Go to Home' });
    await expect.element(logo).toBeInTheDocument();

    await expect.element(logo).toBeInTheDocument();
  });

  it('opens user menu when clicked', async () => {
    await renderComponent(mockUser);

    const userMenuButton = page.getByRole('button', { name: 'Open user menu' });
    await userMenuButton.click();

    await expect.element(page.getByText('Activity')).toBeInTheDocument();
    await expect.element(page.getByText('Talks library')).toBeInTheDocument();
  });
});
