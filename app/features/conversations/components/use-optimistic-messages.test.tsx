import { renderHook } from 'vitest-browser-react';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { useOptimisticMessages } from './use-optimistic-messages.ts';

vi.mock('~/app-platform/components/user-context.tsx', () => ({
  useUser: vi.fn(),
}));

describe('useOptimisticMessages hook', () => {
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

  const createMessages = (): Array<Message> => [
    {
      id: 'msg-1',
      sender: { userId: 'user-1', name: 'John Doe', picture: null, role: 'SPEAKER' },
      content: 'First message',
      reactions: [],
      sentAt: new Date('2023-01-01T10:00:00Z'),
    },
    {
      id: 'msg-2',
      sender: { userId: 'user-2', name: 'Jane Doe', picture: null, role: 'ORGANIZER' },
      content: 'Second message',
      reactions: [],
      sentAt: new Date('2023-01-01T11:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue(mockUser);
  });

  it('returns original messages', async () => {
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'SPEAKER'));

    expect(result.current.optimisticMessages.length).toBe(2);
    expect(result.current.optimisticMessages[0].id).toBe('msg-1');
    expect(result.current.optimisticMessages[0].content).toBe('First message');
    expect(result.current.optimisticMessages[1].id).toBe('msg-2');
    expect(result.current.optimisticMessages[1].content).toBe('Second message');
  });

  it('adds new message when saving without id', async () => {
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'SPEAKER'));

    result.current.onOptimisticSaveMessage({ content: 'New optimistic message' });

    expect(messages.length).toBe(3);
    expect(messages[2].id).toBe('new');
    expect(messages[2].content).toBe('New optimistic message');
    expect(messages[2].sender.userId).toBe('user-1');
    expect(messages[2].sender.name).toBe('John Doe');
    expect(messages[2].sender.role).toBe('SPEAKER');
  });

  it('updates existing message when saving with id', async () => {
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'SPEAKER'));

    result.current.onOptimisticSaveMessage({ id: 'msg-1', content: 'Updated first message' });

    expect(messages.length).toBe(2);
    expect(messages[0].id).toBe('msg-1');
    expect(messages[0].content).toBe('Updated first message');
    expect(messages[1].content).toBe('Second message');
  });

  it('does not update when message id is not found', async () => {
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'SPEAKER'));

    result.current.onOptimisticSaveMessage({ id: 'msg-999', content: 'Should not be added' });

    expect(messages.length).toBe(2);
    expect(messages[0].content).toBe('First message');
    expect(messages[1].content).toBe('Second message');
  });

  it('does not add new message when user is not logged in', async () => {
    vi.mocked(useUser).mockReturnValue(null);
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'SPEAKER'));

    result.current.onOptimisticSaveMessage({ content: 'Should not be added' });

    expect(messages.length).toBe(2);
  });

  it('removes message when deleting', async () => {
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'SPEAKER'));

    result.current.onOptimisticDeleteMessage('msg-1');

    expect(messages.length).toBe(1);
    expect(messages[0].id).toBe('msg-2');
    expect(messages[0].content).toBe('Second message');
  });

  it('uses correct role for new messages', async () => {
    const messages = createMessages();
    const { result } = await renderHook(() => useOptimisticMessages(messages, 'ORGANIZER'));

    result.current.onOptimisticSaveMessage({ content: 'Organizer message' });

    expect(messages[2].sender.role).toBe('ORGANIZER');
  });
});
