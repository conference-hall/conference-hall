import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Emoji } from '../../../types/emojis.types.ts';
import { EmojiPicker } from './emoji-picker.tsx';

const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
];

describe('EmojiPicker component', () => {
  it('displays emoji picker and select an emoji', async () => {
    const onSelectEmoji = vi.fn();

    render(<EmojiPicker emojis={EMOJIS} onSelectEmoji={onSelectEmoji} />);

    const button = screen.getByRole('button', { name: 'Select a reaction' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const thumbsUpButton = await screen.findByRole('button', { name: 'Thumbs up' });
    await userEvent.click(thumbsUpButton);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(onSelectEmoji).toHaveBeenCalledWith(EMOJIS.at(0));
  });

  it('can disable some emojis', async () => {
    const onSelectEmoji = vi.fn();

    render(<EmojiPicker emojis={EMOJIS} disabledEmojis={['+1']} onSelectEmoji={onSelectEmoji} />);

    const button = screen.getByRole('button', { name: 'Select a reaction' });
    await userEvent.click(button);

    const thumbsUpButton = await screen.findByRole('button', { name: 'Thumbs up' });
    expect(thumbsUpButton).toHaveAttribute('disabled');

    const thumbsDownButton = await screen.findByRole('button', { name: 'Thumbs down' });
    expect(thumbsDownButton).not.toHaveAttribute('disabled');
  });
});
