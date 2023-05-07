import { z } from 'zod';
import { checkbox } from 'zod-form-data';

export const EventReviewSettingsSchema = z.object({
  displayProposalsRatings: checkbox(),
  displayProposalsSpeakers: checkbox(),
});
