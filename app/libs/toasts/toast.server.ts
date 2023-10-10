import { createCookieSessionStorage, json, redirect } from '@remix-run/node';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

import { config } from '../config.ts';

export const toastKey = 'toast';

const TypeSchema = z.enum(['message', 'success', 'error']);

const ToastSchema = z.object({
  id: z.string().default(() => uuid()),
  title: z.string().optional(),
  type: TypeSchema.default('message'),
  description: z.string().optional(),
});

type ToastType = z.infer<typeof TypeSchema>;

export type Toast = z.infer<typeof ToastSchema>;

export type OptionalToast = Omit<Toast, 'id' | 'type'> & {
  id?: string;
  type?: ToastType;
};

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__toast',
    path: '/',
    httpOnly: true,
    secure: true,
    secrets: [config.COOKIE_SIGNED_SECRET],
    sameSite: 'strict',
  },
});

export async function redirectWithToast(url: string, type: ToastType, title: string) {
  return redirect(url, { headers: await createToastHeaders({ type, title }) });
}

export async function toast(type: ToastType, title: string) {
  return json(null, { headers: await createToastHeaders({ type, title }) });
}

export async function getToast(request: Request) {
  const session = await toastSessionStorage.getSession(request.headers.get('cookie'));
  const result = ToastSchema.safeParse(session.get(toastKey));
  const toast = result.success ? result.data : null;
  return {
    toast,
    headers: toast
      ? new Headers({
          'set-cookie': await toastSessionStorage.destroySession(session),
        })
      : null,
  };
}

export async function createToastHeaders(optionalToast: OptionalToast) {
  const session = await toastSessionStorage.getSession();
  const toast = ToastSchema.parse(optionalToast);
  session.flash(toastKey, toast);
  const cookie = await toastSessionStorage.commitSession(session);
  return new Headers({ 'set-cookie': cookie });
}
