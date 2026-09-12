import { parseTalkLink, parseTalkLinks } from './talk-links.ts';

describe('parseTalkLink', () => {
  it('returns the slides provider name', () => {
    expect(parseTalkLink('slides', 'https://speakerdeck.com/jane/talk')).toEqual({
      kind: 'slides',
      url: 'https://speakerdeck.com/jane/talk',
      provider: 'Speaker Deck',
      host: 'speakerdeck.com',
      display: 'speakerdeck.com/jane/talk',
    });
  });

  it('returns the video provider name', () => {
    expect(parseTalkLink('video', 'https://youtube.com/watch?v=abc')).toEqual({
      kind: 'video',
      url: 'https://youtube.com/watch?v=abc',
      provider: 'YouTube',
      host: 'youtube.com',
      display: 'youtube.com/watch?v=abc',
    });
  });

  it('does not deduce the provider from the other category', () => {
    expect(parseTalkLink('slides', 'https://youtube.com/watch?v=abc')?.provider).toBeNull();
    expect(parseTalkLink('video', 'https://speakerdeck.com/jane/talk')?.provider).toBeNull();
  });

  it('collapses sub domains on the main domain', () => {
    expect(parseTalkLink('slides', 'https://docs.google.com/presentation/d/abc')?.provider).toEqual('Google');
    expect(parseTalkLink('video', 'https://player.vimeo.com/video/123')?.provider).toEqual('Vimeo');
  });

  it('handles short domains', () => {
    expect(parseTalkLink('video', 'https://youtu.be/abc')?.provider).toEqual('YouTube');
  });

  it('removes the www prefix from the host', () => {
    expect(parseTalkLink('slides', 'https://www.noti.st/jane/deck')).toEqual({
      kind: 'slides',
      url: 'https://www.noti.st/jane/deck',
      provider: 'Notist',
      host: 'noti.st',
      display: 'noti.st/jane/deck',
    });
  });

  it('falls back on the host for an unknown provider', () => {
    expect(parseTalkLink('slides', 'https://bpetetot.github.io/slides/?theme=dark')).toEqual({
      kind: 'slides',
      url: 'https://bpetetot.github.io/slides/?theme=dark',
      provider: null,
      host: 'bpetetot.github.io',
      display: 'bpetetot.github.io/slides/?theme=dark',
    });
  });

  it('omits the root path from the display', () => {
    expect(parseTalkLink('video', 'https://vimeo.com/')?.display).toEqual('vimeo.com');
  });

  it('falls back on the raw value for an unparsable url', () => {
    expect(parseTalkLink('slides', 'not a url')).toEqual({
      kind: 'slides',
      url: 'not a url',
      provider: null,
      host: 'not a url',
      display: 'not a url',
    });
  });

  it('returns null without url', () => {
    expect(parseTalkLink('slides', null)).toBeNull();
    expect(parseTalkLink('slides', '')).toBeNull();
  });
});

describe('parseTalkLinks', () => {
  it('returns the existing links, slides first', () => {
    const links = parseTalkLinks({
      slidesUrl: 'https://speakerdeck.com/jane/talk',
      videoUrl: 'https://youtube.com/watch?v=abc',
    });

    expect(links.map(({ kind, provider }) => ({ kind, provider }))).toEqual([
      { kind: 'slides', provider: 'Speaker Deck' },
      { kind: 'video', provider: 'YouTube' },
    ]);
  });

  it('skips missing links', () => {
    const links = parseTalkLinks({ slidesUrl: null, videoUrl: 'https://youtube.com/watch?v=abc' });

    expect(links.map(({ kind }) => kind)).toEqual(['video']);
  });

  it('returns an empty list without links', () => {
    expect(parseTalkLinks({ slidesUrl: null, videoUrl: null })).toEqual([]);
  });
});
