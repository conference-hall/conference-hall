import { randFullName } from '@ngneat/falso';
import { db } from '../../prisma/db.server.ts';
import type { Event, User } from '../../prisma/generated/client.ts';
import type { SubmissionPassCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  event: Event;
  user?: User;
  attributes?: Partial<SubmissionPassCreateInput>;
};

export const submissionPassFactory = (options: FactoryOptions) => {
  const { attributes = {}, event, user } = options;

  const defaultAttributes: SubmissionPassCreateInput = {
    label: randFullName(),
    event: { connect: { id: event.id } },
    ...(user ? { user: { connect: { id: user.id } } } : {}),
  };

  return db.submissionPass.create({ data: { ...defaultAttributes, ...attributes } });
};
