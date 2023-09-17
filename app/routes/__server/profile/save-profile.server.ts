import { db } from '~/libs/db.ts';
import { UserNotFoundError } from '~/libs/errors.ts';
import type { AdditionalInfoData, DetailsData, PersonalInfoData } from '~/routes/__types/profile.schema.tsx';

export async function saveUserPersonalInfo(userId: string, data: PersonalInfoData) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();

  await db.user.update({ where: { id: userId }, data: { name: data.name, email: data.email, picture: data.picture } });
}

export async function saveUserDetails(userId: string, data: DetailsData) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();

  await db.user.update({ where: { id: userId }, data: { bio: data.bio, references: data.references } });
}

export async function saveUserAdditionalInfo(userId: string, data: AdditionalInfoData) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();

  await db.user.update({
    where: { id: userId },
    data: {
      company: data.company,
      address: data.address,
      socials: { github: data.github, twitter: data.twitter },
    },
  });
}
