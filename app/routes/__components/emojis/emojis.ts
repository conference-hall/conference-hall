// TODO: Move to types and/or utils

export type Emoji = {
  code: string;
  skin: string;
  name: string;
};

export type EmojiReaction = {
  code: string;
  reacted: boolean;
  reactedBy: Array<string>;
};

export const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
  { code: 'heart', skin: '❤️', name: 'Heart' },
  { code: 'smile', skin: '😄', name: 'Laughing' },
  { code: 'cry', skin: '😢', name: 'Sadness' },
  { code: 'tada', skin: '🎉', name: 'Celebration' },
  { code: 'rocket', skin: '🚀', name: 'Excitement' },
  { code: 'fire', skin: '🔥', name: 'Trending' },
  { code: 'clap', skin: '👏', name: 'Applause' },
  { code: 'thinking_face', skin: '🤔', name: 'Thinking' },
];

export function getEmoji(code: string, emojis: Array<Emoji>) {
  return emojis.find((emoji) => emoji.code === code);
}
