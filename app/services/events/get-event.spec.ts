import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { getEvent } from './get-event.server';

describe('#getEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default response', async () => {
    const event = await eventFactory({
      traits: ['conference-cfp-open', 'withSurvey'],
    });
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });

    const result = await getEvent(event.slug);

    expect(result.success && result.data).toEqual({
      id: event.id,
      slug: event.slug,
      type: event.type,
      name: event.name,
      address: event.address,
      conferenceStart: event.conferenceStart?.toUTCString(),
      conferenceEnd: event.conferenceEnd?.toUTCString(),
      description: event.description,
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      bannerUrl: event.bannerUrl,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: 'OPENED',
      isCfpOpen: true,
      surveyEnabled: true,
      hasTracks: true,
      formats: [{ id: format.id, name: format.name, description: format.description }],
      categories: [
        {
          id: category.id,
          name: category.name,
          description: category.description,
        },
      ],
    });
  });

  it('throws an error when event not found', async () => {
    const result = await getEvent('XXX');
    expect(result.errors[0].message).toEqual('Event not found');
  });
});
