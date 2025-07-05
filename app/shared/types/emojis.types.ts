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
