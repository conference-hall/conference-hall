import { z } from 'zod';
import { TalkUrlSchema } from './speaker-talk.types.ts';

describe('TalkUrlSchema', () => {
  it('accepts an https link', () => {
    const result = TalkUrlSchema.safeParse('https://speakerdeck.com/jane/talk');

    expect(result.success && result.data).toEqual('https://speakerdeck.com/jane/talk');
  });

  it('trims surrounding whitespaces', () => {
    const result = TalkUrlSchema.safeParse('  https://speakerdeck.com/jane/talk\n');

    expect(result.success && result.data).toEqual('https://speakerdeck.com/jane/talk');
  });

  it('keeps the url as pasted, without normalization', () => {
    const result = TalkUrlSchema.safeParse('https://youtube.com/watch?v=abc&utm_source=newsletter');

    expect(result.success && result.data).toEqual('https://youtube.com/watch?v=abc&utm_source=newsletter');
  });

  it('rejects an http link', () => {
    const result = TalkUrlSchema.safeParse('http://speakerdeck.com/jane/talk');

    expect(result.success).toEqual(false);
    expect(z.flattenError(result.error!).formErrors).toEqual(['Enter a valid link starting with https://']);
  });

  it('rejects a javascript link', () => {
    const result = TalkUrlSchema.safeParse('javascript:alert(1)');

    expect(result.success).toEqual(false);
    expect(z.flattenError(result.error!).formErrors).toEqual(['Enter a valid link starting with https://']);
  });

  it('rejects a link longer than 500 characters', () => {
    const result = TalkUrlSchema.safeParse(`https://speakerdeck.com/${'a'.repeat(501 - 24)}`);

    expect(result.success).toEqual(false);
    expect(z.flattenError(result.error!).formErrors).toEqual(['Link is too long (500 characters max).']);
  });

  it('returns null for an empty value', () => {
    expect(TalkUrlSchema.safeParse(null).data).toEqual(null);
    expect(TalkUrlSchema.safeParse(undefined).data).toEqual(null);
  });
});
