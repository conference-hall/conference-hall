import { type JSX, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { InputPassword } from './input-password.tsx';

type WrapperProps = Omit<React.ComponentProps<typeof InputPassword>, 'onChange'>;

function InputPasswordWrapper(props: WrapperProps) {
  const [value, onChange] = useState(props.value);
  return (
    <I18nextProvider i18n={i18nTest}>
      <InputPassword {...props} value={value} onChange={onChange} />
    </I18nextProvider>
  );
}

describe('InputPassword component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/auth/login', Component: () => Component }]);
    return page.render(<RouteStub initialEntries={['/auth/login']} />);
  };

  describe('For a current password field', () => {
    it('renders password with forgot password link', async () => {
      await renderComponent(<InputPasswordWrapper value="password123" forgotPasswordPath="/forgot-password" />);

      const forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
      await expect.element(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');

      const passwordInput = page.getByLabelText('Password');
      await expect.element(passwordInput).toHaveValue('password123');
      await expect.element(passwordInput).toHaveAttribute('type', 'password');
      await expect.element(passwordInput).toHaveAttribute('autoComplete', 'current-password');

      await passwordInput.fill('otherPassword');
      await expect.element(passwordInput).toHaveValue('otherPassword');
    });
  });

  describe('For a new password field', () => {
    it('renders password with strength meter', async () => {
      await renderComponent(<InputPasswordWrapper value="" isNewPassword />);

      const forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
      await expect.element(forgotPasswordLink).not.toBeInTheDocument();

      const passwordInput = page.getByLabelText('Password');
      await expect.element(passwordInput).toHaveValue('');
      await expect.element(passwordInput).toHaveAttribute('type', 'password');
      await expect.element(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      await expect.element(page.getByText('Too weak')).toBeVisible();

      await passwordInput.fill('aB');
      await expect.element(page.getByText('Weak')).toBeVisible();

      await passwordInput.fill('aBcDeF1!');
      await expect.element(page.getByText('Strong')).toBeVisible();

      await passwordInput.fill('aBcDeF1!gH');
      await expect.element(page.getByText('Very strong')).toBeVisible();
    });
  });

  describe('Toggle password visibility', () => {
    it('renders password with forgot password link', async () => {
      await renderComponent(<InputPasswordWrapper value="password123" />);

      const passwordInput = page.getByLabelText('Password');
      const toggleVisibilityButton = page.getByRole('button', { name: 'Toggle password visibility' });

      await expect.element(passwordInput).toHaveAttribute('type', 'password');

      await toggleVisibilityButton.click();
      await expect.element(passwordInput).toHaveAttribute('type', 'text');

      await toggleVisibilityButton.click();
      await expect.element(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
