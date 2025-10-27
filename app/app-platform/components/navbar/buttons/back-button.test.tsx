import { HomeIcon } from '@heroicons/react/20/solid';
import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { BackButton, useBackNavigation } from './back-button.tsx';

describe('BackButton component', () => {
  const renderComponent = (Component: JSX.Element, initialEntries = ['/']) => {
    const RouteStub = createRoutesStub([
      {
        path: '/*',
        Component: () => Component,
      },
    ]);
    return render(<RouteStub initialEntries={initialEntries} />);
  };

  it('renders back button with default arrow icon', async () => {
    const screen = await renderComponent(<BackButton to="/home" label="home" />);

    const backButton = screen.getByRole('link');
    await expect.element(backButton).toBeInTheDocument();
    await expect.element(backButton).toHaveAttribute('href', '/home');
  });

  it('renders back button with custom icon', async () => {
    const screen = await renderComponent(<BackButton to="/dashboard" label="dashboard" icon={HomeIcon} />);

    const backButton = screen.getByRole('link');
    await expect.element(backButton).toBeInTheDocument();
    await expect.element(backButton).toHaveAttribute('href', '/dashboard');
  });
});

describe('useBackNavigation hook', () => {
  const TestComponent = ({ routes }: { routes: any[] }) => {
    const { backPath, title } = useBackNavigation(routes);
    return (
      <div>
        <span data-testid="back-path">{backPath}</span>
        <span data-testid="title">{title || 'No title'}</span>
      </div>
    );
  };

  const renderHook = (routes: any[], pathname: string) => {
    const RouteStub = createRoutesStub([
      {
        path: '/*',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <TestComponent routes={routes} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub initialEntries={[pathname]} />);
  };

  describe('Route matching', () => {
    it('returns fallback when no route matches', async () => {
      const routes = [{ path: '/team/:team', back: '/', title: 'Team' }];

      const screen = await renderHook(routes, '/unknown/route');

      await expect.element(screen.getByTestId('back-path')).toHaveTextContent('/');
      await expect.element(screen.getByTestId('title')).toHaveTextContent('No title');
    });

    it('handles wildcard routes', async () => {
      const routes = [
        { path: '/speaker/talks/*', back: '/speaker/talks', title: 'Talk Detail' },
        { path: '/*', back: '/' },
      ];

      const screen = await renderHook(routes, '/speaker/talks/my-awesome-talk');

      await expect.element(screen.getByTestId('back-path')).toHaveTextContent('/speaker/talks');
      await expect.element(screen.getByTestId('title')).toHaveTextContent('Talk Detail');
    });
  });

  describe('Title handling', () => {
    it('returns title when provided', async () => {
      const routes = [{ path: '/settings/*', back: '/', title: 'Settings Page' }];

      const screen = await renderHook(routes, '/settings/profile');

      await expect.element(screen.getByTestId('title')).toHaveTextContent('Settings Page');
    });

    it('returns undefined when title not provided', async () => {
      const routes = [{ path: '/home', back: '/' }];

      const screen = await renderHook(routes, '/home');

      await expect.element(screen.getByTestId('title')).toHaveTextContent('No title');
    });
  });

  describe('Edge cases', () => {
    it('handles empty routes array', async () => {
      const screen = await renderHook([], '/any/path');

      await expect.element(screen.getByTestId('back-path')).toHaveTextContent('/');
      await expect.element(screen.getByTestId('title')).toHaveTextContent('No title');
    });

    it('handles malformed route patterns', async () => {
      const routes = [
        { path: '', back: '/', title: 'Empty' },
        { path: '/valid/:param', back: '/valid', title: 'Valid' },
      ];

      const screen = await renderHook(routes, '/valid/test');

      await expect.element(screen.getByTestId('back-path')).toHaveTextContent('/valid');
      await expect.element(screen.getByTestId('title')).toHaveTextContent('Valid');
    });
  });
});
