import { db } from '~/libs/db.server';

type UserAccountCreateInput = {
  uid: string;
  name: string;
  email?: string;
  picture?: string;
  provider: string;
};

export class UserRegistration {
  static async register(data: UserAccountCreateInput) {
    const account = await db.account.findUnique({ where: { uid: data.uid }, include: { user: true } });

    if (account) return account.user.id;

    const { uid, name, email = `${data.uid}@example.com`, picture, provider } = data;

    const newAccount = await db.account.create({
      data: {
        uid: uid,
        name,
        email,
        picture,
        provider,
        user: { create: { name, email, picture: picture } },
      },
      include: { user: true },
    });

    return newAccount.user.id;
  }
}
