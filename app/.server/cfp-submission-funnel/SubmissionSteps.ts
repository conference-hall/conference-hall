import { db } from 'prisma/db.server';
import { EventNotFoundError } from '~/libs/errors.server';

type Step = { key: string; name: string; path: string; form?: string; enabled: boolean };

type SubmissionStepsInputs = { eventSlug: string; talkSlug?: string; hasSurvey: boolean; hasTracks: boolean };

// TODO: Add tests
export class SubmissionSteps {
  constructor(private inputs: SubmissionStepsInputs) {}

  static async for(eventSlug: string, talkSlug?: string) {
    const settings = await db.event.findUnique({
      select: { surveyEnabled: true, categories: true, formats: true },
      where: { slug: eventSlug },
    });
    if (!settings) throw new EventNotFoundError();

    return new SubmissionSteps({
      eventSlug,
      talkSlug,
      hasSurvey: settings?.surveyEnabled ?? false,
      hasTracks: settings?.categories.length > 0 || settings?.formats.length > 0,
    });
  }

  static async nextStepFor(currentStepKey: string, eventSlug: string, talkSlug: string) {
    const submissionSteps = await SubmissionSteps.for(eventSlug, talkSlug);
    return submissionSteps.getNextStep(currentStepKey);
  }

  get steps(): Array<Step> {
    return [
      {
        key: 'selection',
        name: 'Selection',
        form: undefined,
        path: `/${this.inputs.eventSlug}/submission`,
        enabled: true,
      },
      {
        key: 'proposal',
        name: 'Proposal',
        form: 'proposal-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.talkSlug}`,
        enabled: true,
      },
      {
        key: 'speakers',
        name: 'Speakers',
        form: 'speakers-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.talkSlug}/speakers`,
        enabled: true,
      },
      {
        key: 'tracks',
        name: 'Tracks',
        form: 'tracks-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.talkSlug}/tracks`,
        enabled: this.inputs.hasTracks,
      },
      {
        key: 'survey',
        name: 'Survey',
        form: 'survey-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.talkSlug}/survey`,
        enabled: this.inputs.hasSurvey,
      },
      {
        key: 'submission',
        name: 'Submission',
        form: undefined,
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.talkSlug}/submit`,
        enabled: true,
      },
    ].filter((step) => step.enabled);
  }

  getNextStep(key: string) {
    const steps = this.steps;
    const currentStepIndex = steps.findIndex((step) => step.key === key);

    return steps[currentStepIndex + 1];
  }
}
