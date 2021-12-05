import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';

export async function buildUser(input: Partial<Prisma.UserUncheckedCreateInput> = {}) {
  const data: Prisma.UserUncheckedCreateInput = {
    name: 'User',
    email: 'user@example.net',
    ...input,
  };

  return db.user.create({ data });
}