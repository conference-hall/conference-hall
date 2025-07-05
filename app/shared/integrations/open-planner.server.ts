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
      showInFeedback: z.boolean().nullish(),
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

async function postSessionsAndSpeakers(eventId: string, apiKey: string, payload: OpenPlannerSessionsPayload) {
  const validation = OpenPlannerSessionsPayloadSchema.safeParse(payload);

  if (!eventId || !apiKey || !validation.success) {
    return { success: false, error: 'Invalid OpenPlanner payload. Please, open a bug.' };
  }

  const url = `${BASE_URL}/v1/${eventId}/sessions-speakers?apiKey=${encodeURIComponent(apiKey)}`;

  await fetch(url, {
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

async function checkConfiguration(eventId: string, apiKey: string) {
  if (!eventId || !apiKey) {
    return { success: false, error: 'Invalid event id or API key.' };
  }

  try {
    const url = `${BASE_URL}/v1/${eventId}/sessions-speakers?apiKey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: [], speakers: [] }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid OpenPlanner API key.');
      }
      if (response.status === 400) {
        throw new Error('Invalid OpenPlanner event id.');
      }
      throw new Error('Unknown error.');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error.',
    };
  }
}

export const OpenPlanner = { postSessionsAndSpeakers, checkConfiguration };
