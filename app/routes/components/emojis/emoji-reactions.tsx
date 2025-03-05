import { cva, cx } from 'class-variance-authority';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { Emoji, EmojiReaction } from '../../../types/emojis.types.ts';
import { EmojiPicker } from './emoji-picker.tsx';

type EmojiReactionsProps = {
  emojis: Array<Emoji>;
  reactions: Array<EmojiReaction>;
  onChangeEmoji: (emoji: Emoji) => void;
  className?: string;
};

const emojiReactionStyles = cva('flex items-center gap-2 rounded-full shrink-0 h-6 px-2 cursor-pointer', {
  variants: {
    reacted: {
      true: 'bg-blue-50 ring-1 ring-blue-600',
      false: 'bg-gray-100 hover:bg-white hover:ring-1 hover:ring-gray-600',
    },
  },
  defaultVariants: { reacted: false },
});

export function EmojiReactions({ emojis, reactions, onChangeEmoji, className }: EmojiReactionsProps) {
  return (
    <ul className={cx('flex items-center flex-wrap gap-2', className)}>
      {reactions.map((reaction) => {
        const emoji = emojis.find((emoji) => emoji.code === reaction.code);
        if (!emoji) return null;

        const tooltip = (
          <span>
            <strong>{reaction.reactedBy.join(', ')}</strong> reacted with {emoji.skin}
          </span>
        );

        return (
          <li key={emoji.code}>
            <Tooltip text={tooltip}>
              <button
                type="button"
                aria-label={emoji.name}
                onClick={() => onChangeEmoji(emoji)}
                className={emojiReactionStyles({ reacted: reaction.reacted })}
              >
                <span className="font-serif text-s">{emoji.skin}</span>
                <Text size="xs" weight="medium">
                  {reaction.reactedBy.length}
                </Text>
              </button>
            </Tooltip>
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
