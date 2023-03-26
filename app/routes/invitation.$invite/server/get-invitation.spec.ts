import { InviteType } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { inviteFactory } from 'tests/factories/invite';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { InvitationNotFoundError } from '../../../libs/errors';
import { getInvitation } from './get-invitation.server';

describe('#getInvitation', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns invite for a proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const invite = await inviteFactory({ proposal, user: speaker });

    const result = await getInvitation(invite?.id!);

    expect(result).toEqual({
      type: InviteType.PROPOSAL,
      title: proposal.title,
      invitedBy: speaker.name,
    });
  });

  it('returns invite for a talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const invite = await inviteFactory({ talk, user: speaker });

    const result = await getInvitation(invite?.id!);

    expect(result).toEqual({
      type: InviteType.TALK,
      title: talk.title,
      invitedBy: speaker.name,
    });
  });

  it('returns invite for an organization', async () => {
    const owner = await userFactory();
    const organization = await organizationFactory({ owners: [owner] });
    const invite = await inviteFactory({ organization, user: owner });

    const result = await getInvitation(invite?.id!);

    expect(result).toEqual({
      type: InviteType.ORGANIZATION,
      title: organization.name,
      invitedBy: owner.name,
    });
  });

  it('throws an error when invite is not found', async () => {
    await expect(getInvitation('XXX')).rejects.toThrowError(InvitationNotFoundError);
  });
});
