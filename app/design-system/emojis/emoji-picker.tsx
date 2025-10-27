import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import type { Emoji } from '~/shared/types/emojis.types.ts';
import { ButtonIcon } from '../button-icon.tsx';

type EmojiPickerProps = {
  emojis: Array<Emoji>;
  label?: string;
  anchor?: 'top' | 'bottom';
  className?: string;
  variant: 'primary' | 'secondary' | 'tertiary';
  icon: React.ComponentType<{ className?: string }>;
  onSelectEmoji: (emoji: Emoji) => void;
};

export function EmojiPicker({ emojis, label, icon: Icon, variant, anchor, onSelectEmoji }: EmojiPickerProps) {
  const { t } = useTranslation();

  return (
    <Popover className="relative">
      <PopoverButton
        as={ButtonIcon}
        label={label || t('common.emoji.select')}
        title={label || t('common.emoji.select')}
        variant={variant}
        size="xs"
        icon={Icon}
      />

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
