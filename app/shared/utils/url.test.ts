import { extractMainDomain } from './url.ts';

describe('extractMainDomain', () => {
  it('returns the domain when the hostname has no subdomain', () => {
    expect(extractMainDomain('speakerdeck.com')).toBe('speakerdeck.com');
  });

  it('strips the www subdomain', () => {
    expect(extractMainDomain('www.speakerdeck.com')).toBe('speakerdeck.com');
  });

  it('strips multiple subdomains', () => {
    expect(extractMainDomain('sub.a.b.example.com')).toBe('example.com');
  });

  it('handles two-letter top-level domains', () => {
    expect(extractMainDomain('noti.st')).toBe('noti.st');
    expect(extractMainDomain('dai.ly')).toBe('dai.ly');
    expect(extractMainDomain('youtu.be')).toBe('youtu.be');
  });

  it('handles hyphens in the domain', () => {
    expect(extractMainDomain('a-b.co')).toBe('a-b.co');
  });

  it('returns an empty string for a hostname without a top-level domain', () => {
    expect(extractMainDomain('localhost')).toBe('');
  });

  it('returns an empty string for an IP address', () => {
    expect(extractMainDomain('192.168.1.1')).toBe('');
  });

  it('returns an empty string for an empty hostname', () => {
    expect(extractMainDomain('')).toBe('');
  });

  it('returns the public suffix for multi-part top-level domains', () => {
    expect(extractMainDomain('bbc.co.uk')).toBe('co.uk');
  });

  it('returns an empty string for a fully qualified hostname ending with a dot', () => {
    expect(extractMainDomain('example.com.')).toBe('');
  });

  it('returns an empty string for a one-letter top-level domain', () => {
    expect(extractMainDomain('example.c')).toBe('');
  });
});
