import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { z } from 'zod';
import { requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';
import { jsonToArray } from '../../utils/prisma';

export type SpeakerTalk = {
  id: string;
  title: string;
  abstract: string;
  level: string | null;
  language: string | null;
  references: string | null;
  createdAt: string;
  speakers: Array<{ id: string; name: string | null; photoURL: string | null }>;
};

export const loadSpeakerTalk: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);

  const talk = await db.talk.findFirst({
    where: {
      speakers: { some: { id: uid } },
      id: params.id,
    },
    include: { speakers: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!talk) throw new Response('Talk not found.', { status: 404 });

  const languages = jsonToArray(talk.languages);

  return json<SpeakerTalk>({
    id: talk.id,
    title: talk.title,
    abstract: talk.abstract,
    level: talk.level,
    language: languages.length > 0 ? languages[0] : null,
    references: talk.references,
    createdAt: talk.createdAt.toISOString(),
    speakers: talk.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL })),
  });
};

export const editSpeakerTalk: ActionFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const { id } = params;

  const talk = await db.talk.findFirst({
    where: { id, speakers: { some: { id: uid } } },
  });
  if (!talk) throw new Response('Talk not found.', { status: 404 });

  const form = await request.formData();
  const method = form.get('_method');

  if (method === 'DELETE') {
    await db.talk.delete({ where: { id } });
    return redirect('/speaker/talks');
  } else {
    const result = validateTalkForm(form);
    if (!result.success) {
      return result.error.flatten();
    }

    await db.talk.update({
      where: { id },
      data: result.data,
    });

    return redirect(`/speaker/talks/${id}`);
  }
};

export function validateTalkForm(form: FormData) {
  const ProposalSchema = z.object({
    title: z.string().nonempty(),
    abstract: z.string().nonempty(),
    references: z.string().nullable(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
    languages: z.array(z.string()),
  });

  return ProposalSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    languages: form.get('language') ? [form.get('language')] : [],
  });
}
