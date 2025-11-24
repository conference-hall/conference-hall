import { useFetchers } from 'react-router';
import { renderHook } from 'vitest-browser-react';
import { useUser } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useOptimisticMessages } from './use-optimistic-messages.ts';

vi.mock('react-router', () => ({
  useFetchers: vi.fn(),
}));

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
    vi.mocked(useFetchers).mockReturnValue([]);
  });

  it('returns original messages when no pending operations', async () => {
    const { result } = await renderHook(() => useOptimisticMessages(createMessages(), 'message', 'SPEAKER'));

    expect(result.current.length).toBe(2);
    expect(result.current[0].id).toBe('msg-1');
    expect(result.current[0].content).toBe('First message');
    expect(result.current[1].id).toBe('msg-2');
    expect(result.current[1].content).toBe('Second message');
  });

  it('adds optimistic message when saving new message', async () => {
    const formData = new FormData();
    formData.append('intent', 'save-message');
    formData.append('message', 'New optimistic message');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticMessages(createMessages(), 'message', 'SPEAKER'));

    expect(result.current.length).toBe(3);
    expect(result.current[2].id).toBe('new');
    expect(result.current[2].content).toBe('New optimistic message');
    expect(result.current[2].sender.userId).toBe('user-1');
    expect(result.current[2].sender.name).toBe('John Doe');
  });

  it('updates message optimistically when editing existing message', async () => {
    const formData = new FormData();
    formData.append('intent', 'save-message');
    formData.append('id', 'msg-1');
    formData.append('message', 'Updated first message');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticMessages(createMessages(), 'message', 'SPEAKER'));

    expect(result.current.length).toBe(2);
    expect(result.current[0].id).toBe('msg-1');
    expect(result.current[0].content).toBe('Updated first message');
    expect(result.current[1].content).toBe('Second message');
  });

  it('removes message optimistically when deleting', async () => {
    const formData = new FormData();
    formData.append('intent', 'delete-message');
    formData.append('id', 'msg-1');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticMessages(createMessages(), 'message', 'SPEAKER'));

    expect(result.current.length).toBe(1);
    expect(result.current[0].id).toBe('msg-2');
    expect(result.current[0].content).toBe('Second message');
  });

  it('handles multiple pending operations', async () => {
    const formData1 = new FormData();
    formData1.append('intent', 'save-message');
    formData1.append('message', 'New message 1');

    const formData2 = new FormData();
    formData2.append('intent', 'delete-message');
    formData2.append('id', 'msg-1');

    vi.mocked(useFetchers).mockReturnValue([
      { formData: formData1, state: 'submitting' } as never,
      { formData: formData2, state: 'submitting' } as never,
    ]);

    const { result } = await renderHook(() => useOptimisticMessages(createMessages(), 'message', 'SPEAKER'));

    expect(result.current.length).toBe(2);
    expect(result.current[0].id).toBe('msg-2');
    expect(result.current[1].id).toBe('new');
    expect(result.current[1].content).toBe('New message 1');
  });

  it('ignores fetchers with different intent suffix', async () => {
    const formData = new FormData();
    formData.append('intent', 'save-other');
    formData.append('message', 'Should be ignored');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticMessages(createMessages(), 'message', 'SPEAKER'));

    expect(result.current.length).toBe(2);
    expect(result.current[0].content).toBe('First message');
    expect(result.current[1].content).toBe('Second message');
  });
});
