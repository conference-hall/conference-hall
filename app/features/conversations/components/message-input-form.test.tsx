import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { MESSAGE_MAX_LENGTH, type Message } from '~/shared/types/conversation.types.ts';
import { MessageInputForm } from './message-input-form.tsx';

describe('MessageInputForm component', () => {
  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async () => null,
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <MessageInputForm channel="speaker" placeholder="Type a message..." inputLabel="Message input" {...props} />
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

  it('caps the textarea to the maximum message length', async () => {
    await renderComponent();

    const textarea = page.getByRole('textbox', { name: 'Message input' });
    expect(textarea.element()).toHaveAttribute('maxlength', String(MESSAGE_MAX_LENGTH));
  });

  it('renders a live character counter that updates while typing', async () => {
    await renderComponent();

    await expect.element(page.getByText(`0 / ${MESSAGE_MAX_LENGTH}`)).toBeInTheDocument();

    await page.getByRole('textbox', { name: 'Message input' }).fill('hello');
    await expect.element(page.getByText(`5 / ${MESSAGE_MAX_LENGTH}`)).toBeInTheDocument();
  });

  it('initializes the character counter from an existing message', async () => {
    const message: Message = {
      id: 'msg-1',
      sender: { userId: 'user-1', name: 'John Doe', picture: null },
      content: 'Existing message',
      reactions: [],
      sentAt: new Date(),
    };

    await renderComponent({ message });

    await expect.element(page.getByText(`16 / ${MESSAGE_MAX_LENGTH}`)).toBeInTheDocument();
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
