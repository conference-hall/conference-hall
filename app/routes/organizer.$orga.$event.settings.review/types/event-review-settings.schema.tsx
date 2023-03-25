import { z } from 'zod';
import { checkbox } from 'zod-form-data';

export const EventReviewSettingsSchema = z.object({
  displayOrganizersRatings: checkbox(),
  displayProposalsRatings: checkbox(),
  displayProposalsSpeakers: checkbox(),
});
