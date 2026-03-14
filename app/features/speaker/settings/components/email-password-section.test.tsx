import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { EmailPasswordSection } from './email-password-section.tsx';

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: {
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    requestPasswordReset: vi.fn(),
  },
  getAuthError: vi.fn((error: { code?: string }) => `error.auth.${error.code}` as any),
}));

vi.mock('~/shared/nonce/use-nonce.ts', () => ({
  useNonce: () => '',
}));

const defaultProps = {
  email: 'user@example.com',
  hasPassword: true,
  captchaSiteKey: undefined,
};

const renderComponent = (props = {}) => {
  const RouteStub = createRoutesStub([
    {
      path: '/speaker/settings',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <EmailPasswordSection {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/speaker/settings']} />);
};

describe('EmailPasswordSection', () => {
  it('renders email and password info', async () => {
    await renderComponent();

    await expect.element(page.getByText('Email and password')).toBeVisible();
    await expect.element(page.getByText('user@example.com')).toBeVisible();
    await expect.element(page.getByText('••••••••')).toBeVisible();
  });

  it('shows "No password set" when hasPassword is false', async () => {
    await renderComponent({ hasPassword: false });

    const buttons = page.getByRole('button', { name: 'Add' });
    await expect.element(buttons).toBeVisible();
    await expect.element(page.getByText('No password set')).toBeVisible();
  });

  describe('ChangeEmailModal', () => {
    it('opens change email modal and submits new email', async () => {
      vi.mocked(authClient.changeEmail).mockResolvedValue({ data: {}, error: null } as any);

      await renderComponent();

      const editButtons = page.getByRole('button', { name: 'Edit' });
      await editButtons.first().click();

      const dialog = page.getByRole('dialog', { name: 'Change your email' });
      const emailInput = dialog.getByRole('textbox');
      await expect.element(emailInput).toBeVisible();

      await emailInput.fill('new@example.com');
      await dialog.getByRole('button', { name: 'Send link' }).click();

      expect(authClient.changeEmail).toHaveBeenCalledWith({
        newEmail: 'new@example.com',
        callbackURL: '/speaker/settings',
      });
    });

    it('does not submit when new email equals current email', async () => {
      await renderComponent();

      const editButtons = page.getByRole('button', { name: 'Edit' });
      await editButtons.first().click();

      const dialog = page.getByRole('dialog', { name: 'Change your email' });
      const emailInput = dialog.getByRole('textbox');
      await expect.element(emailInput).toBeVisible();

      await emailInput.fill('user@example.com');
      await dialog.getByRole('button', { name: 'Send link' }).click();

      expect(authClient.changeEmail).not.toHaveBeenCalled();
    });
  });

  describe('ChangePasswordModal', () => {
    it('opens change password modal and submits', async () => {
      vi.mocked(authClient.changePassword).mockResolvedValue({ data: {}, error: null } as any);

      await renderComponent();

      const editButtons = page.getByRole('button', { name: 'Edit' });
      await editButtons.last().click();

      const dialog = page.getByRole('dialog', { name: 'Change your password' });
      await expect.element(dialog.getByLabelText('Current password')).toBeVisible();

      await dialog.getByLabelText('Current password').fill('OldPassword1');
      await dialog.getByLabelText('New password').fill('NewPassword1');
      await dialog.getByRole('button', { name: 'Edit' }).click();

      expect(authClient.changePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
        revokeOtherSessions: true,
      });
    });

    it('shows validation error for weak new password', async () => {
      await renderComponent();

      const editButtons = page.getByRole('button', { name: 'Edit' });
      await editButtons.last().click();

      const dialog = page.getByRole('dialog', { name: 'Change your password' });
      await expect.element(dialog.getByLabelText('Current password')).toBeVisible();

      await dialog.getByLabelText('Current password').fill('OldPassword1');
      await dialog.getByLabelText('New password').fill('short');
      await dialog.getByRole('button', { name: 'Edit' }).click();

      await expect.element(page.getByText('Minimum 8 characters.')).toBeVisible();
      expect(authClient.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('AddPasswordModal', () => {
    it('opens add password modal and sends reset link', async () => {
      vi.mocked(authClient.requestPasswordReset).mockResolvedValue({ data: {}, error: null } as any);

      await renderComponent({ hasPassword: false });

      await page.getByRole('button', { name: 'Add' }).click();

      const dialog = page.getByRole('dialog', { name: 'Set your password' });
      const sendLinkButton = dialog.getByRole('button', { name: 'Send link' });
      await expect.element(sendLinkButton).toBeVisible();

      await sendLinkButton.click();

      expect(authClient.requestPasswordReset).toHaveBeenCalledWith(
        { email: 'user@example.com', redirectTo: '/auth/reset-password' },
        { headers: undefined },
      );
    });
  });
});
