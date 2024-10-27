import { cva, cx } from 'class-variance-authority';
import { Text } from '~/design-system/typography.tsx';
import { EmojiPicker } from './emoji-picker.tsx';
import { type Emoji, type EmojiReaction, getEmoji } from './emojis.ts';

type EmojiReactionsProps = {
  emojis: Array<Emoji>;
  reactions: Array<EmojiReaction>;
  label?: string;
  onChangeEmoji: (emoji: Emoji) => void;
  className?: string;
};

const emojiReactionStyles = cva('flex items-center gap-2 rounded-full shrink-0 h-6 px-2', {
  variants: {
    reacted: {
      true: 'bg-blue-50 ring-1 ring-blue-600',
      false: 'bg-gray-100 hover:bg-white hover:ring-1 hover:ring-gray-600',
    },
  },
  defaultVariants: { reacted: false },
});

// TODO: Add tests
// TODO: Add reactedBy tooltip
export function EmojiReactions({ emojis, reactions, onChangeEmoji, className }: EmojiReactionsProps) {
  return (
    <ul className={cx('flex items-center flex-wrap gap-2', className)}>
      {reactions.map((reaction) => {
        const emoji = getEmoji(reaction.code, emojis);
        if (!emoji) return null;

        return (
          <li key={emoji.code}>
            <button
              type="button"
              className={emojiReactionStyles({ reacted: reaction.reacted })}
              aria-label={emoji.name}
              title={emoji.name}
              onClick={() => onChangeEmoji(emoji)}
            >
              <span className="font-serif text-s">{emoji.skin}</span>
              <Text size="xs" weight="medium">
                {reaction.reactedBy.length}
              </Text>
            </button>
          </li>
        );
      })}

      <li>
        <EmojiPicker
          emojis={emojis}
          disabledEmojis={reactions.map((reaction) => reaction.code)}
          onSelectEmoji={onChangeEmoji}
        />
      </li>
    </ul>
  );
}
