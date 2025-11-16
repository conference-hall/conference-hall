import type { CustomTemplateName } from '../email.types.ts';
import AuthAccountDeleted from './auth/account-deleted.tsx';
import AuthEmailVerification from './auth/email-verification.tsx';
import AuthResetPassword from './auth/reset-password.tsx';
import BaseEmail from './base-email.tsx';
import BaseEventEmail from './base-event-email.tsx';
import OrganizersProposalConfirmed from './organizers/proposal-confirmed.tsx';
import OrganizersProposalDeclined from './organizers/proposal-declined.tsx';
import OrganizersProposalSubmitted from './organizers/proposal-submitted.tsx';
import SpeakersConversationMessage from './speakers/conversation-message.tsx';
import SpeakersProposalAccepted from './speakers/proposal-accepted.tsx';
import SpeakersProposalRejected from './speakers/proposal-rejected.tsx';
import SpeakersProposalSubmitted from './speakers/proposal-submitted.tsx';

const EMAIL_TEMPLATES = {
  'base-email': BaseEmail,
  'base-event-email': BaseEventEmail,
  'auth-account-deleted': AuthAccountDeleted,
  'auth-email-verification': AuthEmailVerification,
  'auth-reset-password': AuthResetPassword,
  'organizers-proposal-confirmed': OrganizersProposalConfirmed,
  'organizers-proposal-declined': OrganizersProposalDeclined,
  'organizers-proposal-submitted': OrganizersProposalSubmitted,
  'speakers-conversation-message': SpeakersConversationMessage,
  'speakers-proposal-accepted': SpeakersProposalAccepted,
  'speakers-proposal-rejected': SpeakersProposalRejected,
  'speakers-proposal-submitted': SpeakersProposalSubmitted,
} as const;

export type EmailTemplateName = keyof typeof EMAIL_TEMPLATES;

export function getEmailTemplate(template: EmailTemplateName): any {
  return EMAIL_TEMPLATES[template] || null;
}

export function getCustomTemplate(template: CustomTemplateName): any {
  return EMAIL_TEMPLATES[template] || null;
}
