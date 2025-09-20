import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { NavbarFullscreen } from './navbar-fullscreen.tsx';

describe('NavbarFullscreen component', () => {
  const renderComponent = (Component: JSX.Element, initialEntries = ['/team/team-1/new/event']) => {
    const RouteStub = createRoutesStub([
      { path: '/team/:team/new/*', Component: () => Component },
      { path: '/team/:team', Component: () => Component },
      { path: '/', Component: () => Component },
      { path: '/some-other-route', Component: () => Component },
    ]);
    return render(
      <I18nextProvider i18n={i18nTest}>
        <RouteStub initialEntries={initialEntries} />
      </I18nextProvider>,
    );
  };

  it('renders logo and close button', async () => {
    const screen = renderComponent(<NavbarFullscreen />);

    const logo = screen.getByRole('link', { name: 'Go to Home' });
    await expect.element(logo).toBeInTheDocument();
    await expect.element(logo).toHaveAttribute('href', '/');

    const closeButton = screen.getByRole('link', { name: 'Close' });
    await expect.element(closeButton).toBeInTheDocument();
    await expect.element(closeButton).toHaveAttribute('href', '/team/team-1');
  });

  it('provides correct back navigation for team new route', async () => {
    const screen = renderComponent(<NavbarFullscreen />, ['/team/team-1/new/event']);

    const closeButton = screen.getByRole('link', { name: 'Close' });
    await expect.element(closeButton).toBeInTheDocument();
    await expect.element(closeButton).toHaveAttribute('href', '/team/team-1');
  });

  it('provides fallback navigation for unknown routes', async () => {
    const screen = renderComponent(<NavbarFullscreen />, ['/some-other-route']);

    const closeButton = screen.getByRole('link', { name: 'Close' });
    await expect.element(closeButton).toBeInTheDocument();
    await expect.element(closeButton).toHaveAttribute('href', '/');
  });

  it('handles route parameters correctly', async () => {
    const screen = renderComponent(<NavbarFullscreen />, ['/team/my-awesome-team/new/conference']);

    const closeButton = screen.getByRole('link', { name: 'Close' });
    await expect.element(closeButton).toBeInTheDocument();
    await expect.element(closeButton).toHaveAttribute('href', '/team/my-awesome-team');
  });

  it('works with deeply nested routes', async () => {
    const screen = renderComponent(<NavbarFullscreen />, ['/team/team-1/new/event/step-2/details']);

    const closeButton = screen.getByRole('link', { name: 'Close' });
    await expect.element(closeButton).toBeInTheDocument();
    await expect.element(closeButton).toHaveAttribute('href', '/team/team-1');
  });
});
