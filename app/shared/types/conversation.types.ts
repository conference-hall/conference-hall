import type { EmojiReaction } from './emojis.types.ts';

export type Message = {
  id: string;
  sender: {
    userId: string;
    name: string;
    picture: string | null;
    role: 'SPEAKER' | 'ORGANIZER';
  };
  content: string;
  reactions: Array<EmojiReaction>;
  sentAt: Date;
};
