import { extractMainDomain } from '../utils/url.ts';

const SLIDES_PROVIDERS: Record<string, string> = {
  'speakerdeck.com': 'Speaker Deck',
  'noti.st': 'Notist',
  'slideshare.net': 'Slideshare',
  'slides.com': 'Slides',
  'google.com': 'Google',
  'canva.com': 'Canva',
  'pitch.com': 'Pitch',
};

const VIDEO_PROVIDERS: Record<string, string> = {
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'youtube-nocookie.com': 'YouTube',
  'vimeo.com': 'Vimeo',
  'dailymotion.com': 'Dailymotion',
  'dai.ly': 'Dailymotion',
};

export type TalkLinkKind = 'slides' | 'video';

export type TalkLink = {
  kind: TalkLinkKind;
  url: string;
  provider: string | null;
  host: string;
  display: string;
};

export function parseTalkLink(kind: TalkLinkKind, url: string | null): TalkLink | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const providers = kind === 'slides' ? SLIDES_PROVIDERS : VIDEO_PROVIDERS;
    const provider = providers[extractMainDomain(host)] ?? null;
    const display = `${host}${parsed.pathname === '/' ? '' : parsed.pathname}${parsed.search}`;
    return { kind, url, provider, host, display };
  } catch {
    return { kind, url, provider: null, host: url, display: url };
  }
}

export function parseTalkLinks(talk: { slidesUrl: string | null; videoUrl: string | null }): Array<TalkLink> {
  return [parseTalkLink('slides', talk.slidesUrl), parseTalkLink('video', talk.videoUrl)].filter(
    (link): link is TalkLink => link !== null,
  );
}
