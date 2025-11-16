import type { Message } from '@conference-hall/shared/types/conversation.types.ts';
import { useFetchers } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';

type PendingFetcher = ReturnType<typeof useFetchers>[number] & {
  formData: FormData;
};

export function useOptimisticMessages(messages: Array<Message>, intentSuffix: string, role: 'SPEAKER' | 'ORGANIZER') {
  const currentUser = useUser();
  const saveIntent = `save-${intentSuffix}`;
  const deleteIntent = `delete-${intentSuffix}`;

  const messagesById = new Map(messages.map((message) => [message.id, message]));

  const fetchers = useFetchers();

  const pendingMessages = fetchers
    .filter((fetcher): fetcher is PendingFetcher => {
      if (!fetcher.formData) return false;
      const formIntent = fetcher.formData.get('intent');
      return formIntent === saveIntent || formIntent === deleteIntent;
    })
    .map((fetcher) => ({
      intent: String(fetcher.formData.get('intent')),
      id: String(fetcher.formData?.get('id') || ''),
      content: String(fetcher.formData?.get('message')),
    }));

  for (const message of pendingMessages) {
    if (!currentUser) continue;
    const sender = { userId: currentUser.id, name: currentUser.name, picture: currentUser.picture, role };

    // add message
    if (message.intent === saveIntent && !message.id) {
      messagesById.set('new', { id: 'new', sender, content: message.content, reactions: [], sentAt: new Date() });
      continue;
    }

    const currentMessage = messagesById.get(message.id);

    // update message
    if (message.intent === saveIntent && currentMessage) {
      currentMessage.content = message.content;
      continue;
    }

    // delete message
    if (message.intent === deleteIntent && currentMessage) {
      messagesById.delete(currentMessage.id);
    }
  }

  return Array.from(messagesById.values());
}
