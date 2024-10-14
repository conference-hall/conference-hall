import { z } from 'zod';

const BASE_URL = 'https://api.openplanner.fr';

const OpenPlannerSessionsPayloadSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      abstract: z.string().nullish(),
      speakerIds: z.array(z.string()).min(1),
      language: z.string().nullish(),
      level: z.string().nullish(),
      formatId: z.string().nullish(),
      formatName: z.string().nullish(),
      categoryId: z.string().nullish(),
      categoryName: z.string().nullish(),
    }),
  ),
  speakers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      bio: z.string().nullish(),
      company: z.string().nullish(),
      photoUrl: z.string().nullish(),
      socials: z.array(z.object({ name: z.string(), link: z.string() })),
    }),
  ),
});

export type OpenPlannerSessionsPayload = z.infer<typeof OpenPlannerSessionsPayloadSchema>;

// TODO: the POST is not awaiting the fetch call (fire-and-forget)
// Because the call can be very long and result with a timeout.
// This should be done with a job later.
async function postSessionsAndSpeakers(eventId: string, apiKey: string, payload: OpenPlannerSessionsPayload) {
  const validation = OpenPlannerSessionsPayloadSchema.safeParse(payload);

  if (!eventId || !apiKey || !validation.success) {
    return { success: false, error: 'Invalid OpenPlanner payload. Please, open a bug.' };
  }

  const url = `${BASE_URL}/v1/${eventId}/sessions-speakers?apiKey=${encodeURIComponent(apiKey)}`;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.log({
      level: 'error',
      message: `Open planner error: ${error.message}`,
    });
  });
}

export const OpenPlanner = { postSessionsAndSpeakers };
