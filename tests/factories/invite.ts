import type { Organization, Prisma, Proposal, Talk, User } from '@prisma/client';
import { db } from '../../app/libs/db';
import { userFactory } from './users';

type FactoryOptions = {
  proposal?: Proposal;
  talk?: Talk;
  organization?: Organization;
  user?: User;
  attributes?: Partial<Prisma.InviteCreateInput>;
};

export const inviteFactory = async (options: FactoryOptions) => {
  const { attributes, proposal, talk, organization, user } = options;

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

  if (organization) {
    const inviteBy = user || (await userFactory());
    const defaultAttributes: Prisma.InviteCreateInput = {
      type: 'ORGANIZATION',
      organization: { connect: { id: organization.id } },
      invitedBy: { connect: { id: inviteBy.id } },
    };
    return db.invite.create({ data: { ...defaultAttributes, ...attributes } });
  }
};
