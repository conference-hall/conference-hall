import type { SurveyDetailedAnswer } from './survey.types.ts';

export enum SpeakerProposalStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  DeliberationPending = 'DeliberationPending',
  AcceptedByOrganizers = 'AcceptedByOrganizers',
  RejectedByOrganizers = 'RejectedByOrganizers',
  ConfirmedBySpeaker = 'ConfirmedBySpeaker',
  DeclinedBySpeaker = 'DeclinedBySpeaker',
}

export type SocialLinks = Array<string>;

export type SpeakerData = {
  id: string;
  name: string;
  email?: string;
  picture?: string | null;
  company?: string | null;
  bio?: string | null;
  references?: string | null;
  location?: string | null;
  socialLinks?: SocialLinks;
  survey?: Array<SurveyDetailedAnswer>;
};
