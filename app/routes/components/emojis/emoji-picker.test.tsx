import { userEvent } from '@vitest/browser/context';
import { render } from 'vitest-browser-react';
import type { Emoji } from '../../../types/emojis.types.ts';
import { EmojiPicker } from './emoji-picker.tsx';

const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
];

describe('EmojiPicker component', () => {
  it('displays emoji picker and select an emoji', async () => {
    const onSelectEmoji = vi.fn();

    const screen = render(<EmojiPicker emojis={EMOJIS} onSelectEmoji={onSelectEmoji} />);

    const button = screen.getByRole('button', { name: 'Select a reaction' });
    await expect.element(button).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(button);
    await expect.element(button).toHaveAttribute('aria-expanded', 'true');

    const thumbsUpButton = screen.getByRole('button', { name: 'Thumbs up' });
    await userEvent.click(thumbsUpButton);

    await expect.element(button).toHaveAttribute('aria-expanded', 'false');
    expect(onSelectEmoji).toHaveBeenCalledWith(EMOJIS.at(0));
  });

  it('can disable some emojis', async () => {
    const onSelectEmoji = vi.fn();

    const screen = render(<EmojiPicker emojis={EMOJIS} disabledEmojis={['+1']} onSelectEmoji={onSelectEmoji} />);

    const button = screen.getByRole('button', { name: 'Select a reaction' });
    await userEvent.click(button);

    const thumbsUpButton = await screen.getByRole('button', { name: 'Thumbs up' });
    await expect.element(thumbsUpButton).toHaveAttribute('disabled');

    const thumbsDownButton = await screen.getByRole('button', { name: 'Thumbs down' });
    await expect.element(thumbsDownButton).not.toHaveAttribute('disabled');
  });
});
