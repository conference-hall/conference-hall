import { teamFactory } from 'tests/factories/team';

import { disconnectDB, resetDB } from '../../../../tests/db-helpers';
import { eventCategoryFactory } from '../../../../tests/factories/categories';
import { eventFactory } from '../../../../tests/factories/events';
import { eventFormatFactory } from '../../../../tests/factories/formats';
import { EventNotFoundError } from '../../../libs/errors';
import { getEvent } from './get-event.server';

describe('#getEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default response', async () => {
    const team = await teamFactory();
    const event = await eventFactory({ team, traits: ['conference-cfp-open', 'withSurvey'] });
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });

    const result = await getEvent(event.slug);

    expect(result).toEqual({
      id: event.id,
      slug: event.slug,
      type: event.type,
      name: event.name,
      teamName: team.name,
      address: event.address,
      conferenceStart: event.conferenceStart?.toUTCString(),
      conferenceEnd: event.conferenceEnd?.toUTCString(),
      description: event.description,
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      logo: event.logo,
      maxProposals: event.maxProposals,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: 'OPENED',
      isCfpOpen: true,
      surveyEnabled: true,
      hasTracks: true,
      formats: [{ id: format.id, name: format.name, description: format.description }],
      formatsRequired: false,
      categories: [
        {
          id: category.id,
          name: category.name,
          description: category.description,
        },
      ],
      categoriesRequired: false,
    });
  });

  it('throws an error when event not found', async () => {
    await expect(getEvent('XXX')).rejects.toThrowError(EventNotFoundError);
  });
});
