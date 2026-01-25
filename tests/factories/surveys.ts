import type { Event, User } from '../../prisma/generated/client.ts';
import type { SurveyCreateInput } from '../../prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  user: User;
  event: Event;
  attributes?: Partial<SurveyCreateInput>;
};

export const surveyFactory = (options: FactoryOptions) => {
  const { attributes = {}, user, event } = options;

  const defaultAttributes: Partial<SurveyCreateInput> = {
    answers: [],
    user: { connect: { id: user.id } },
    event: { connect: { id: event.id } },
  };

  const data = {
    ...defaultAttributes,
    ...attributes,
  } as SurveyCreateInput;

  return db.survey.create({ data });
};
