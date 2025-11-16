import type { Message } from '@conference-hall/shared/types/conversation.types.ts';
import type { Emoji } from '@conference-hall/shared/types/emojis.types.ts';
import { useFetchers, useSubmit } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';

export function useOptimisticReactions(message: Message, intentSuffix: string) {
  const currentUser = useUser();
  const submit = useSubmit();
  const intent = `react-${intentSuffix}`;

  // Form submission
  const onChangeReaction = ({ code }: Emoji) => {
    submit(
      { intent, id: message.id, code },
      {
        method: 'POST',
        fetcherKey: `${intent}:${message.id}:${code}`,
        preventScrollReset: true,
        navigate: false,
      },
    );
  };

  // Optimistic list
  type PendingReactions = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const reactionsByCode = new Map(message.reactions.map((reaction) => [reaction.code, reaction]));

  const fetchers = useFetchers();

  const pendingReactions = fetchers
    .filter((fetcher): fetcher is PendingReactions => {
      if (!fetcher.formData) return false;
      const formIntent = fetcher.formData.get('intent');
      const formId = fetcher.formData.get('id');
      return formIntent === intent && formId === message.id;
    })
    .map((fetcher) => ({
      code: String(fetcher.formData?.get('code')),
    }));

  for (const reaction of pendingReactions) {
    const current = reactionsByCode.get(reaction.code);

    if (!currentUser) continue;
    const reactedBy = { userId: currentUser.id, name: currentUser.name };

    // add reaction
    if (!current) {
      reactionsByCode.set(reaction.code, { code: reaction.code, reacted: true, reactedBy: [reactedBy] });
      continue;
    }

    // increment reaction
    if (!current.reacted) {
      current.reacted = true;
      current.reactedBy.push(reactedBy);
      continue;
    }

    // decrement reaction
    if (current.reacted && current.reactedBy.length > 1) {
      current.reacted = false;
      current.reactedBy = current.reactedBy.filter((user) => user.userId !== currentUser.id);
      continue;
    }

    // delete reaction
    if (current.reacted && current.reactedBy.length === 1) {
      reactionsByCode.delete(reaction.code);
    }
  }

  return { reactions: Array.from(reactionsByCode.values()), onChangeReaction };
}
