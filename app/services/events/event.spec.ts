import { disconnectDB, resetDB } from '../../../tests/db-helpers';
import { EventCategoryFactory } from '../../../tests/factories/categories';
import { EventFactory } from '../../../tests/factories/events';
import { EventFormatFactory } from '../../../tests/factories/formats';
import { EventNotFoundError } from '../errors';
import { getEvent } from './event.server';

describe('#getEvent', () => {
  beforeEach(() => resetDB());
  afterAll(() => disconnectDB());

  it('should return the default response', async () => {
    const event = await EventFactory('conference-cfp-open', 'withSurvey').create();
    const format = await EventFormatFactory().create({ event: { connect: { id: event.id } } });
    const category = await EventCategoryFactory().create({ event: { connect: { id: event.id } } });

    const result = await getEvent(event.slug);

    expect(result).toEqual({
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
      surveyEnabled: true, // TODO not necessary? hasSurvey: true
      hasSurvey: true,
      hasTracks: true,
      formats: [{ id: format.id, name: format.name, description: format.description }],
      categories: [{ id: category.id, name: category.name, description: category.description }],
    });
  });

  it('should throw an error when event not found', async () => {
    await expect(getEvent('XXX')).rejects.toThrowError(EventNotFoundError);
  });
});
