import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageInputForm } from './message-input-form.tsx';

describe('MessageInputForm component', () => {
  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async () => null,
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <MessageInputForm
              intent="save-message"
              placeholder="Type a message..."
              inputLabel="Message input"
              {...props}
            />
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub initialEntries={['/']} />);
  };

  it('renders form with textarea and submit button', async () => {
    await renderComponent({ buttonLabel: 'Send' });

    await expect.element(page.getByRole('textbox', { name: 'Message input' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('renders with default value when editing message', async () => {
    const message: Message = {
      id: 'msg-1',
      sender: { userId: 'user-1', name: 'John Doe', picture: null },
      content: 'Existing message',
      reactions: [],
      sentAt: new Date(),
    };

    await renderComponent({ message });

    const textarea = page.getByRole('textbox', { name: 'Message input' });
    expect(textarea).toHaveValue('Existing message');
  });

  it('renders cancel button when onClose is provided', async () => {
    const onClose = vi.fn();
    await renderComponent({ onClose, buttonLabel: 'Save' });

    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
