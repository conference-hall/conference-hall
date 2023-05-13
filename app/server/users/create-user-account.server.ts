import { db } from '~/libs/db';
import type { UserCreateInput } from '~/schemas/user';

export async function createUserAccount(input: UserCreateInput) {
  const account = await db.account.findUnique({ where: { uid: input.uid } });

  if (account) return account.userId;

  const { uid, name, email = `${input.uid}@example.com`, picture, provider } = input;

  const created = await db.account.create({
    data: {
      uid: uid,
      name,
      email,
      picture,
      provider,
      user: { create: { name, email, picture: picture } },
    },
  });

  return created.userId;
}
