import { createCookieSessionStorage, data } from 'react-router';
import { getWebServerEnv } from 'servers/environment.server.ts';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

const env = getWebServerEnv();

const toastKey = 'toast';

const TypeSchema = z.enum(['message', 'success', 'error']);

const ToastSchema = z.object({
  id: z.string().default(() => uuid()),
  title: z.string().optional(),
  type: TypeSchema.default('message'),
});

type ToastType = z.infer<typeof TypeSchema>;

export type Toast = z.infer<typeof ToastSchema>;

const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'toast',
    path: '/',
    httpOnly: true,
    secure: true,
    secrets: [env.COOKIE_SIGNED_SECRET],
    sameSite: 'lax',
  },
});

export async function toast(type: ToastType, title: string) {
  return data(null, { headers: await toastHeaders(type, title) });
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

export async function toastHeaders(type: ToastType, title: string) {
  const session = await toastSessionStorage.getSession();
  const toast = ToastSchema.parse({ type, title });
  session.flash(toastKey, toast);
  const cookie = await toastSessionStorage.commitSession(session);
  return { 'set-cookie': cookie };
}
