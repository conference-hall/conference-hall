import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { AuthProvidersSignin } from './auth-providers-signin.tsx';

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: { signIn: { social: vi.fn() } },
  PROVIDERS: [
    { id: 'google', label: 'Google', icon: () => null },
    { id: 'github', label: 'GitHub', icon: () => null },
  ],
}));

const defaultProps = {
  redirectTo: '/dashboard',
};

const renderComponent = (props = {}) => {
  const RouteStub = createRoutesStub([
    {
      path: '/auth/login',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <AuthProvidersSignin {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/auth/login']} />);
};

describe('AuthProvidersSignin', () => {
  it('renders a button for each provider', async () => {
    await renderComponent();

    await expect.element(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible();
  });

  it('calls authClient.signIn.social with Google provider and redirectTo', async () => {
    await renderComponent();

    await page.getByRole('button', { name: 'Continue with Google' }).click();

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/dashboard',
      errorCallbackURL: '/auth/error',
    });
  });

  it('uses custom redirectTo path', async () => {
    await renderComponent({ redirectTo: '/events' });

    await page.getByRole('button', { name: 'Continue with Google' }).click();

    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/events',
      errorCallbackURL: '/auth/error',
    });
  });
});
