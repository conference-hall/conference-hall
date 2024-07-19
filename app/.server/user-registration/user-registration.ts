import { db } from 'prisma/db.server.ts';

type UserAccountCreateInput = {
  uid: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  picture?: string;
  provider: string;
};

export class UserRegistration {
  static async register(data: UserAccountCreateInput) {
    const authentication = await db.authenticationMethod.findUnique({
      where: { uid: data.uid },
      include: { user: true },
    });

    if (authentication) return authentication.user.id;

    const {
      uid,
      name = '(No name)',
      email = `${data.uid}@example.com`,
      emailVerified,
      picture,
      provider = 'unknown',
    } = data;

    const newAuthentication = await db.authenticationMethod.create({
      data: {
        uid: uid,
        name,
        email,
        picture,
        provider,
        user: { create: { name, email, emailVerified, picture } },
      },
      include: { user: true },
    });

    return newAuthentication.user.id;
  }
}
