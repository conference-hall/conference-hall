import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';

import { SubmissionSteps } from './submission-steps.ts';

describe('SubmissionSteps', () => {
  describe('#steps', () => {
    it('return all steps for a full event', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open', 'withSurvey'] });
      await eventFormatFactory({ event });
      await eventCategoryFactory({ event });

      const { steps } = await SubmissionSteps.for(event.slug, 'talkId');

      expect(steps).toEqual([
        {
          key: 'selection',
          name: 'Selection',
          path: `/${event.slug}/submission`,
          enabled: true,
        },
        {
          key: 'proposal',
          name: 'Proposal',
          form: 'proposal-form',
          path: `/${event.slug}/submission/talkId`,
          enabled: true,
        },
        {
          key: 'speakers',
          name: 'Speakers',
          form: 'speakers-form',
          path: `/${event.slug}/submission/talkId/speakers`,
          enabled: true,
        },
        {
          key: 'tracks',
          name: 'Tracks',
          form: 'tracks-form',
          path: `/${event.slug}/submission/talkId/tracks`,
          enabled: true,
        },
        {
          key: 'survey',
          name: 'Survey',
          form: 'survey-form',
          path: `/${event.slug}/submission/talkId/survey`,
          enabled: true,
        },
        {
          key: 'submission',
          name: 'Submission',
          form: undefined,
          path: `/${event.slug}/submission/talkId/submit`,
          enabled: true,
        },
      ]);
    });

    it('does not return survey or tracks', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });

      const { steps } = await SubmissionSteps.for(event.slug, 'talkId');

      expect(steps.length).toBe(4);
      expect(steps.find((step) => step.key === 'survey')).toBe(undefined);
      expect(steps.find((step) => step.key === 'tracks')).toBe(undefined);
    });
  });
});
