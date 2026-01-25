import { randEmail, randFullName } from '@ngneat/falso';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import type { Event, User } from '../../prisma/generated/client.ts';
import type { EventSpeakerCreateInput } from '../../prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  user?: User;
  attributes?: Partial<EventSpeakerCreateInput>;
};

export const eventSpeakerFactory = async (options: FactoryOptions) => {
  const { attributes = {}, event, user } = options;

  let defaultAttributes: EventSpeakerCreateInput = {
    name: randFullName(),
    email: randEmail(),
    event: { connect: { id: event.id } },
    createdAt: new Date(),
  };

  if (user) {
    defaultAttributes = {
      ...defaultAttributes,
      name: user.name,
      email: user.email,
      bio: user.bio,
      picture: user.picture,
      references: user.references,
      company: user.company,
      location: user.location,
      socialLinks: user.socialLinks as SocialLinks,
      locale: user.locale,
      user: { connect: { id: user.id } },
    };
  }

  return db.eventSpeaker.create({ data: { ...defaultAttributes, ...attributes } });
};
