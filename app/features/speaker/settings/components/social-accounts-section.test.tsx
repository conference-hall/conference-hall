import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { SocialAccountsSection } from './social-accounts-section.tsx';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: {
    linkSocial: vi.fn(),
    unlinkAccount: vi.fn(),
    accountInfo: vi.fn(),
  },
  getAuthError: vi.fn((error: { code?: string }) => `error.auth.${error.code}` as any),
  PROVIDERS: [
    { id: 'google', label: 'Google', icon: () => null },
    { id: 'github', label: 'GitHub', icon: () => null },
  ],
}));

const renderComponent = (props = {}) => {
  const defaultProps = { accounts: [] as Array<{ providerId: string; accountId: string }> };
  const RouteStub = createRoutesStub([
    {
      path: '/speaker/settings',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <SocialAccountsSection {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/speaker/settings']} />);
};

describe('SocialAccountsSection', () => {
  it('renders heading and provider list', async () => {
    await renderComponent();

    await expect.element(page.getByText('Authentication methods')).toBeVisible();
    await expect.element(page.getByText('Google')).toBeVisible();
    await expect.element(page.getByText('GitHub')).toBeVisible();
  });

  it('shows "Add" buttons for unlinked providers', async () => {
    await renderComponent();

    const addButtons = page.getByRole('button', { name: 'Add' });
    await expect.element(addButtons.first()).toBeVisible();
  });

  it('calls authClient.linkSocial when clicking Add on a provider', async () => {
    vi.mocked(authClient.linkSocial).mockResolvedValue({ data: {}, error: null } as any);

    await renderComponent();

    await page.getByRole('button', { name: 'Add' }).first().click();

    expect(authClient.linkSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/speaker/settings',
      errorCallbackURL: '/auth/error?redirectTo=%2Fspeaker%2Fsettings',
    });
  });

  it('shows "Delete" button for linked providers when multiple accounts exist', async () => {
    vi.mocked(authClient.accountInfo).mockResolvedValue({ data: { user: { email: '' } }, error: null } as any);

    await renderComponent({
      accounts: [
        { providerId: 'google', accountId: 'g-123' },
        { providerId: 'github', accountId: 'gh-456' },
      ],
    });

    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    await expect.element(deleteButtons.first()).toBeVisible();
  });

  it('does not show "Delete" button when only one account is linked', async () => {
    vi.mocked(authClient.accountInfo).mockResolvedValue({ data: { user: { email: '' } }, error: null } as any);

    await renderComponent({
      accounts: [{ providerId: 'google', accountId: 'g-123' }],
    });

    await expect.element(page.getByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('calls authClient.unlinkAccount when confirming unlink', async () => {
    vi.mocked(authClient.accountInfo).mockResolvedValue({ data: { user: { email: '' } }, error: null } as any);
    vi.mocked(authClient.unlinkAccount).mockResolvedValue({ data: {}, error: null } as any);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    await renderComponent({
      accounts: [
        { providerId: 'google', accountId: 'g-123' },
        { providerId: 'github', accountId: 'gh-456' },
      ],
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();

    expect(window.confirm).toHaveBeenCalled();
    expect(authClient.unlinkAccount).toHaveBeenCalledWith({ providerId: 'google', accountId: 'g-123' });
  });

  it('does not unlink when confirm is cancelled', async () => {
    vi.mocked(authClient.accountInfo).mockResolvedValue({ data: { user: { email: '' } }, error: null } as any);
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await renderComponent({
      accounts: [
        { providerId: 'google', accountId: 'g-123' },
        { providerId: 'github', accountId: 'gh-456' },
      ],
    });

    await page.getByRole('button', { name: 'Delete' }).first().click();

    expect(authClient.unlinkAccount).not.toHaveBeenCalled();
  });
});
