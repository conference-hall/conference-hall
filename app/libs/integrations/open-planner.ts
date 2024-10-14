import { z } from 'zod';

const BASE_URL = 'https://api.openplanner.fr';

type ApiResponse = { success: true; error: undefined } | { success: false; error: string };

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

async function postSessionsAndSpeakers(eventId: string, apiKey: string, payload: OpenPlannerSessionsPayload) {
  const validation = OpenPlannerSessionsPayloadSchema.safeParse(payload);

  if (!eventId || !apiKey || !validation.success) {
    return { success: false, error: 'Invalid OpenPlanner payload. Please, open a bug.' };
  }

  try {
    const url = `${BASE_URL}/v1/${eventId}/sessions-speakers?apiKey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid OpenPlanner API key.');
      }
      if (response.status === 400) {
        throw new Error('An error occurred with OpenPlanner. Please try again later.');
      }
      throw new Error('OpenPlanner: Unknown error. Please, try again later.');
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OpenPlanner: Unknown error',
    };
  }
}

export const OpenPlanner = { postSessionsAndSpeakers };
