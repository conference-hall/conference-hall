import { useFetcher } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import type { Emoji } from '~/shared/types/emojis.types.ts';

export function useOptimisticReactions(message: Message, intentSuffix: string) {
  const currentUser = useUser();

  const fetcher = useFetcher({ key: `react-${intentSuffix}-${message.id}` });

  const intent = `react-${intentSuffix}`;

  // Form submission
  const onChangeReaction = async ({ code }: Emoji) => {
    if (!currentUser) return;

    const current = message.reactions.find((reaction) => reaction.code === code);

    const reactedBy = { userId: currentUser.id, name: currentUser.name };

    if (!current) {
      // add reaction
      message.reactions.push({ code: code, reacted: true, reactedBy: [reactedBy] });
    } else if (!current.reacted) {
      // increment reaction
      current.reacted = true;
      current.reactedBy.push(reactedBy);
    } else if (current.reacted && current.reactedBy.length > 1) {
      // decrement reaction
      current.reacted = false;
      current.reactedBy = current.reactedBy.filter((user) => user.userId !== currentUser.id);
    } else if (current.reacted && current.reactedBy.length === 1) {
      // delete reaction
      const index = message.reactions.findIndex((reaction) => reaction.code === code);
      message.reactions.splice(index, 1);
    }

    await fetcher.submit({ intent, id: message.id, code }, { method: 'POST' });
  };

  return { reactions: message.reactions, onChangeReaction };
}
