import { db } from 'prisma/db.server.ts';

import { EventNotFoundError } from '~/libs/errors.server.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { SurveyConfig } from '../event-survey/models/survey-config.ts';

type Step = { key: string; name: string; path: string; form?: string; enabled: boolean };

type SubmissionStepsInputs = { eventSlug: string; proposalId?: string; hasSurvey: boolean; hasTracks: boolean };

export class SubmissionSteps {
  constructor(private inputs: SubmissionStepsInputs) {}

  static async for(eventSlug: string, proposalId?: string) {
    const event = await db.event.findUnique({
      select: { surveyEnabled: true, surveyConfig: true, categories: true, formats: true },
      where: { slug: eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    const newSurveyActive = await flags.get('custom-survey');
    const surveyEnabled = newSurveyActive ? new SurveyConfig(event.surveyConfig).isActiveForEvent : event.surveyEnabled;

    return new SubmissionSteps({
      eventSlug,
      proposalId,
      hasSurvey: surveyEnabled,
      hasTracks: event.categories.length > 0 || event.formats.length > 0,
    });
  }

  static async nextStepFor(currentStepKey: string, eventSlug: string, proposalId: string) {
    const submissionSteps = await SubmissionSteps.for(eventSlug, proposalId);
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
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.proposalId}`,
        enabled: true,
      },
      {
        key: 'speakers',
        name: 'Speakers',
        form: 'speakers-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.proposalId}/speakers`,
        enabled: true,
      },
      {
        key: 'tracks',
        name: 'Tracks',
        form: 'tracks-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.proposalId}/tracks`,
        enabled: this.inputs.hasTracks,
      },
      {
        key: 'survey',
        name: 'Survey',
        form: 'survey-form',
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.proposalId}/survey`,
        enabled: this.inputs.hasSurvey,
      },
      {
        key: 'submission',
        name: 'Submission',
        form: undefined,
        path: `/${this.inputs.eventSlug}/submission/${this.inputs.proposalId}/submit`,
        enabled: true,
      },
    ].filter((step) => step.enabled);
  }

  getNextStep(currentStepKey: string) {
    const steps = this.steps;
    const currentStepIndex = steps.findIndex((step) => step.key === currentStepKey);

    return steps[currentStepIndex + 1];
  }
}
