import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import type { Emoji } from '~/shared/types/emojis.types.ts';

type EmojiPickerProps = {
  emojis: Array<Emoji>;
  label?: string;
  anchor?: 'top' | 'bottom';
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelectEmoji: (emoji: Emoji) => void;
};

export function EmojiPicker({ emojis, label, icon: Icon, anchor, className, onSelectEmoji }: EmojiPickerProps) {
  const { t } = useTranslation();

  const buttonStyle =
    className ||
    'flex items-center justify-center rounded-full shrink-0 h-6 w-6 bg-gray-100 fill-gray-600 cursor-pointer hover:bg-white hover:ring-1 hover:ring-gray-600';

  return (
    <Popover className="relative">
      <PopoverButton
        className={buttonStyle}
        aria-label={label || t('common.emoji.select')}
        title={label || t('common.emoji.select')}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </PopoverButton>

      <PopoverPanel
        anchor={anchor || 'bottom end'}
        className="grid grid-cols-5 gap-2 p-2 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden [--anchor-gap:8px] z-50"
      >
        {({ close }) => (
          <>
            {emojis.map((emoji) => (
              <button
                key={emoji.code}
                type="button"
                className={cx(
                  'flex items-center justify-center rounded-lg shrink-0 h-8 w-8 cursor-pointer font-serif text-lg hover:bg-gray-100',
                )}
                aria-label={emoji.name}
                title={emoji.name}
                onClick={() => {
                  onSelectEmoji(emoji);
                  close();
                }}
              >
                {emoji.skin}
              </button>
            ))}
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
