import { userEvent } from '@vitest/browser/context';
import { type JSX, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { PasswordInput } from './password-input.tsx';

type PasswordInputWrapperProps = Omit<React.ComponentProps<typeof PasswordInput>, 'onChange'>;

function PasswordInputWrapper(props: PasswordInputWrapperProps) {
  const [value, onChange] = useState(props.value);
  return (
    <I18nextProvider i18n={i18nTest}>
      <PasswordInput {...props} value={value} onChange={onChange} />
    </I18nextProvider>
  );
}

describe('PasswordInput component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/auth/login', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/auth/login']} />);
  };

  describe('For a current password field', () => {
    it('renders password with forgot password link', async () => {
      const screen = renderComponent(
        <PasswordInputWrapper value="password123" forgotPasswordPath="/forgot-password" />,
      );

      const forgotPasswordLink = screen.getByRole('link', { name: 'Forgot password?' });
      await expect.element(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');

      const passwordInput = screen.getByLabelText('Password');
      await expect.element(passwordInput).toHaveValue('password123');
      await expect.element(passwordInput).toHaveAttribute('type', 'password');
      await expect.element(passwordInput).toHaveAttribute('autoComplete', 'current-password');

      await userEvent.fill(passwordInput, 'otherPassword');
      await expect.element(passwordInput).toHaveValue('otherPassword');
    });
  });

  describe('For a new password field', () => {
    it('renders password with strength meter', async () => {
      const screen = renderComponent(<PasswordInputWrapper value="" isNewPassword />);

      const forgotPasswordLink = screen.getByRole('link', { name: 'Forgot password?' });
      await expect.element(forgotPasswordLink).not.toBeInTheDocument();

      const passwordInput = screen.getByLabelText('Password');
      await expect.element(passwordInput).toHaveValue('');
      await expect.element(passwordInput).toHaveAttribute('type', 'password');
      await expect.element(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      await expect.element(screen.getByText('Too weak')).toBeVisible();

      await userEvent.fill(passwordInput, 'aB');
      await expect.element(screen.getByText('Weak')).toBeVisible();

      await userEvent.fill(passwordInput, 'aBcDeF1!');
      await expect.element(screen.getByText('Strong')).toBeVisible();

      await userEvent.fill(passwordInput, 'aBcDeF1!gH');
      await expect.element(screen.getByText('Very strong')).toBeVisible();
    });
  });

  describe('Toggle password visibility', () => {
    it('renders password with forgot password link', async () => {
      const screen = renderComponent(<PasswordInputWrapper value="password123" />);

      const passwordInput = screen.getByLabelText('Password');
      const toggleVisibilityButton = screen.getByRole('button', { name: 'Toggle password visibility' });

      await expect.element(passwordInput).toHaveAttribute('type', 'password');

      await userEvent.click(toggleVisibilityButton);
      await expect.element(passwordInput).toHaveAttribute('type', 'text');

      await userEvent.click(toggleVisibilityButton);
      await expect.element(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
