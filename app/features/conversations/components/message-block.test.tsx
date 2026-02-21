import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { UserProvider } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageBlock } from './message-block.tsx';

describe('MessageBlock component', () => {
  const mockUser = {
    id: 'user-1',
    uid: 'user-uid-1',
    name: 'John Doe',
    email: 'john@example.com',
    picture: null,
    notificationsUnreadCount: 0,
    hasTeamAccess: true,
    teams: [],
  };

  const message: Message = {
    id: 'msg-1',
    sender: { userId: 'user-1', name: 'John Doe', picture: null, role: 'SPEAKER' },
    content: 'Test message content',
    reactions: [],
    sentAt: new Date('2023-01-01T10:00:00Z'),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (props = {}, user = mockUser) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async () => null,
        Component: () => (
          <UserProvider user={user}>
            <I18nextProvider i18n={i18nTest}>
              <MessageBlock message={message} intentSuffix="message" {...props} />
            </I18nextProvider>
          </UserProvider>
        ),
      },
    ]);
    return page.render(<RouteStub initialEntries={['/']} />);
  };

  it('renders message content and sender', async () => {
    await renderComponent();

    await expect.element(page.getByText('John Doe')).toBeInTheDocument();
    await expect.element(page.getByText('Test message content')).toBeInTheDocument();
    await expect.element(page.getByText('SPEAKER')).toBeInTheDocument();
  });

  it('renders message with reactions', async () => {
    const messageWithReactions: Message = {
      ...message,
      reactions: [
        {
          code: 'tada',
          reacted: true,
          reactedBy: [{ userId: 'user-1', name: 'John Doe' }],
        },
      ],
    };

    await renderComponent({ message: messageWithReactions });

    await expect.element(page.getByText('🎉')).toBeInTheDocument();
  });
});
