import type { Prisma, Proposal, Talk, User } from '@prisma/client';
import { db } from '../../app/services/db';
import { userFactory } from './users';

type FactoryOptions = {
  proposal?: Proposal;
  talk?: Talk;
  user?: User;
  attributes?: Prisma.InviteCreateInput;
};

export const inviteFactory = async (options: FactoryOptions) => {
  const { attributes, proposal, talk, user } = options;

  if (proposal) {
    const inviteBy = user || (await userFactory());
    const defaultAttributes: Prisma.InviteCreateInput = {
      type: 'PROPOSAL',
      proposal: { connect: { id: proposal.id } },
      invitedBy: { connect: { id: inviteBy.id } },
    };
    return db.invite.create({ data: { ...defaultAttributes, ...attributes } });
  }

  if (talk) {
    const inviteBy = user || (await userFactory());
    const defaultAttributes: Prisma.InviteCreateInput = {
      type: 'TALK',
      talk: { connect: { id: talk.id } },
      invitedBy: { connect: { id: inviteBy.id } },
    };
    return db.invite.create({ data: { ...defaultAttributes, ...attributes } });
  }
};
