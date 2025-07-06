import { eventFactory } from 'tests/factories/events.ts';
import { getEventsForSitemap } from './sitemap.server.ts';

describe('#getEventsForSitemap', () => {
  it('returns all events with cfp open', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { name: 'conf-1' } });
    await eventFactory({ traits: ['conference-cfp-future'], attributes: { name: 'conf-2' } });
    await eventFactory({ traits: ['meetup-cfp-open'], attributes: { name: 'conf-3' } });
    await eventFactory({ traits: ['meetup-cfp-close'] });
    await eventFactory({ traits: ['conference-cfp-past'] });

    const result = await getEventsForSitemap();

    const names = result.map((e) => e.name).sort();
    expect(names).toEqual(['conf-1', 'conf-2', 'conf-3']);
    expect(result.find((r) => r.name === 'conf-1')).toEqual({
      name: event.name,
      slug: event.slug,
      logoUrl: event.logoUrl,
    });
  });

  it('doesnt returns private events', async () => {
    await eventFactory({ traits: ['conference-cfp-open'], attributes: { name: 'conf-1' } });
    await eventFactory({ traits: ['conference-cfp-open', 'private'] });

    const result = await getEventsForSitemap();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('conf-1');
  });

  it('doesnt returns archived events', async () => {
    await eventFactory({ traits: ['conference-cfp-open'], attributes: { name: 'conf-1' } });
    await eventFactory({ traits: ['conference-cfp-open', 'archived'] });

    const result = await getEventsForSitemap();

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('conf-1');
  });
});
