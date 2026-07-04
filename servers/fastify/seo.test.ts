import { flags } from '../../app/shared/feature-flags/flags.server.ts';
import { createTestServer } from './test-helpers.ts';

describe('seo header', () => {
  it('adds X-Robots-Tag to every response while the seo flag is off', async () => {
    await flags.set('seo', false);
    const app = await createTestServer();

    const page = await app.inject({ method: 'GET', url: '/some-page' });
    const asset = await app.inject({ method: 'GET', url: '/assets/entry-D3adB33f.js' });

    expect(page.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(asset.headers['x-robots-tag']).toBe('noindex, nofollow');

    await app.close();
  });

  it('does not add X-Robots-Tag when the seo flag is on', async () => {
    await flags.set('seo', true);
    const app = await createTestServer();

    const response = await app.inject({ method: 'GET', url: '/some-page' });

    expect(response.headers['x-robots-tag']).toBeUndefined();

    await app.close();
  });
});
