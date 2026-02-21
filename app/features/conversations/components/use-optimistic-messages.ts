import { useUser } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

export function useOptimisticMessages(messages: Array<Message>, role: 'SPEAKER' | 'ORGANIZER') {
  const currentUser = useUser();

  const onOptimisticSaveMessage = (data: { id?: string; content: string }) => {
    if (data.id) {
      // update message
      const currentMessage = messages.find((message) => message.id === data.id);
      if (!currentMessage) return;
      currentMessage.content = data.content;
    } else {
      // add message
      if (!currentUser) return;
      const sender = { userId: currentUser.id, name: currentUser.name, picture: currentUser.picture, role };
      messages.push({ id: 'new', sender, content: data.content, reactions: [], sentAt: new Date() });
    }
  };

  const onOptimisticDeleteMessage = (id: string) => {
    const index = messages.findIndex((message) => message.id === id);
    messages.splice(index, 1);
  };

  return { optimisticMessages: messages, onOptimisticSaveMessage, onOptimisticDeleteMessage };
}
