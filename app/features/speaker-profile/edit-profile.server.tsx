import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { z } from 'zod';
import { requireAuthUser, requireUserSession } from '../auth/auth.server';
import { db } from '../../services/db';

export type SpeakerProfile = {
  name: string;
  email: string;
  photoURL: string;
  bio: string;
  references: string;
  company: string;
  address: string;
  twitter: string;
  github: string;
};

export const loadProfile: LoaderFunction = async ({ request }) => {
  const user = await requireAuthUser(request);

  return json<SpeakerProfile>({
    name: user.name,
    email: user.email,
    photoURL: user.picture,
    bio: user.bio,
    references: user.references,
    company: user.company,
    address: user.address,
    twitter: user.twitter,
    github: user.github,
  });
};

export const editProfile: ActionFunction = async ({ request }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();

  const type = form.get('_type') as string;
  const result = validateProfileData(form, type);
  if (!result.success) {
    return result.error.flatten();
  }

  await db.user.update({ where: { id: uid }, data: result.data });

  return redirect('/speaker/edit')
};

const SpeakerPersonalInfo = z.object({
  name: z.string().nonempty(),
  email: z.string().email().nonempty(),
  photoURL: z.string().url().nonempty(),
});

const SpeakerDetails = z.object({
  bio: z.string(),
  references: z.string(),
});

const SpeakerAdditionalInfo = z.object({
  company: z.string(),
  address: z.string(),
  twitter: z.string(),
  github: z.string(),
});

type Schema = typeof SpeakerPersonalInfo | typeof SpeakerDetails | typeof SpeakerAdditionalInfo;

export function validateProfileData(form: FormData, type: string) {
  let schema: Schema = SpeakerPersonalInfo;
  if (type === 'DETAILS') schema = SpeakerDetails;
  if (type === 'ADDITIONAL') schema = SpeakerAdditionalInfo;

  return schema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    photoURL: form.get('photoURL'),
    bio: form.get('bio'),
    references: form.get('references'),
    company: form.get('company'),
    address: form.get('address'),
    twitter: form.get('twitter'),
    github: form.get('github'),
  });
}
