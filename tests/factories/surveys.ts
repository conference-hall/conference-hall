import type { Event, Prisma, User } from '@prisma/client';
import { db } from '../../app/libs/db';

type FactoryOptions = {
  user: User;
  event: Event;
  attributes?: Partial<Prisma.SurveyCreateInput>;
};

export const surveyFactory = (options: FactoryOptions) => {
  const { attributes = {}, user, event } = options;

  const defaultAttributes: Partial<Prisma.SurveyCreateInput> = {
    answers: [],
    user: { connect: { id: user.id } },
    event: { connect: { id: event.id } },
  };

  const data = {
    ...defaultAttributes,
    ...attributes,
  } as Prisma.SurveyCreateInput;

  return db.survey.create({ data });
};
