import { z } from 'zod';

export const SPEAKER_INVITATION_MESSAGE_MAX_LENGTH = 2000;

export const SpeakerInvitationSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  message: z.string().trim().max(SPEAKER_INVITATION_MESSAGE_MAX_LENGTH).nullable().default(null),
});

export type SpeakerInvitationData = z.infer<typeof SpeakerInvitationSchema>;
