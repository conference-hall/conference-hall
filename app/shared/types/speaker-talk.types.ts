import { z } from 'zod';

// Talks list
export const TalksListFilterSchema = z.enum(['all', 'archived', 'active']).optional();
export type TalksListFilter = z.infer<typeof TalksListFilterSchema>;

// Talk links
export const TalkUrlSchema = z
  .url({ protocol: /^https$/, error: 'Enter a valid link starting with https://' })
  .trim()
  .max(500, 'Link is too long (500 characters max).')
  .nullable()
  .default(null);

// Talk
export const TalkSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  slidesUrl: TalkUrlSchema,
  videoUrl: TalkUrlSchema,
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
});
export type TalkSaveData = z.infer<typeof TalkSaveSchema>;

// Tracks
export const TracksMandatorySchema = z.array(z.string()).nonempty();
export const TracksOptionalSchema = z.array(z.string()).optional();
const TracksSaveSchema = z.object({ formats: TracksOptionalSchema, categories: TracksOptionalSchema });
export type TracksSaveData = z.infer<typeof TracksSaveSchema>;

// Proposal participation
export const ProposalParticipationSchema = z.object({ participation: z.enum(['CONFIRMED', 'DECLINED']) });
