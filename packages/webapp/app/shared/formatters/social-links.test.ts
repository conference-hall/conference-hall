import { extractSocialProfile } from './social-links.ts';

describe('extractSocialProfile', () => {
  it('extracts GitHub profile', () => {
    expect(extractSocialProfile('https://github.com/johndoe')).toEqual({
      name: 'github',
      profile: 'johndoe',
      url: 'https://github.com/johndoe',
    });
  });

  it('extracts LinkedIn profile', () => {
    expect(extractSocialProfile('http://linkedin.com/in/johndoe')).toEqual({
      name: 'linkedin',
      profile: 'johndoe',
      url: 'http://linkedin.com/in/johndoe',
    });
  });

  it('handles URLs with sub domains', () => {
    expect(extractSocialProfile('https://fr.pinterest.com/johndoe')).toEqual({
      name: 'pinterest',
      profile: 'johndoe',
      url: 'https://fr.pinterest.com/johndoe',
    });
  });

  it('handles URLs with query parameters', () => {
    expect(extractSocialProfile('https://bsky.app/profile/user123?utm_source=test')).toEqual({
      name: 'bluesky',
      profile: 'user123',
      url: 'https://bsky.app/profile/user123?utm_source=test',
    });
  });

  it('handles URLs with hash fragments', () => {
    expect(extractSocialProfile('https://instagram.com/janedoe#section')).toEqual({
      name: 'instagram',
      profile: 'janedoe',
      url: 'https://instagram.com/janedoe#section',
    });
  });

  it('handles URLs with trailing slashes', () => {
    expect(extractSocialProfile('https://facebook.com/johndoe/')).toEqual({
      name: 'facebook',
      profile: 'johndoe',
      url: 'https://facebook.com/johndoe/',
    });
  });

  it('returns link for unknown domain', () => {
    expect(extractSocialProfile('https://unknown/d/d/d')).toEqual({
      name: 'link',
      profile: null,
      url: 'https://unknown/d/d/d',
    });
  });

  it('returns link for invalid URLs', () => {
    expect(extractSocialProfile('not a url')).toEqual({
      name: 'link',
      profile: null,
      url: 'not a url',
    });
  });
});
