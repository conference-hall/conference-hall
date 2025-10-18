import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { UserProvider } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageActionsMenu } from './message-actions-menu.tsx';

describe('MessageActionsMenu component', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    picture: null,
    notificationsUnreadCount: 0,
    hasTeamAccess: true,
    teams: [],
  };

  const message: Message = {
    id: 'msg-1',
    sender: { userId: 'user-1', name: 'John Doe', picture: null },
    content: 'Test message',
    reactions: [],
    sentAt: new Date(),
  };

  const renderComponent = (props = {}, user = mockUser) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async () => null,
        Component: () => (
          <UserProvider user={user}>
            <I18nextProvider i18n={i18nTest}>
              <MessageActionsMenu
                message={message}
                intentSuffix="message"
                canManageConversations={false}
                onEdit={vi.fn()}
                {...props}
              />
            </I18nextProvider>
          </UserProvider>
        ),
      },
    ]);
    return render(<RouteStub initialEntries={['/']} />);
  };

  it('opens menu with edit and delete options', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Message action menu' }));

    await expect.element(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    await expect.element(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    const screen = renderComponent({ onEdit });

    await userEvent.click(screen.getByRole('button', { name: 'Message action menu' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('hides menu when user is not the message sender and canManageConversations is false', async () => {
    const otherUserMessage: Message = {
      ...message,
      sender: { userId: 'user-2', name: 'Jane Doe', picture: null },
    };
    const screen = renderComponent({ message: otherUserMessage, canManageConversations: false });

    await expect.element(screen.getByRole('button', { name: 'Message action menu' })).not.toBeInTheDocument();
  });

  it('shows menu when user is not the message sender but canManageConversations is true', async () => {
    const otherUserMessage: Message = {
      ...message,
      sender: { userId: 'user-2', name: 'Jane Doe', picture: null },
    };
    const screen = renderComponent({ message: otherUserMessage, canManageConversations: true });

    await expect.element(screen.getByRole('button', { name: 'Message action menu' })).toBeInTheDocument();
  });

  it('shows menu when user is the message sender regardless of canManageConversations', async () => {
    const screen = renderComponent({ canManageConversations: false });

    await expect.element(screen.getByRole('button', { name: 'Message action menu' })).toBeInTheDocument();
  });
});
