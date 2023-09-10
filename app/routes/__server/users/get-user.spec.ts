import { TeamRole } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { getUser } from './get-user.server';

describe('#getUser', () => {
  it('returns the default response', async () => {
    const user = await userFactory();

    const response = await getUser(user.id);
    expect(response).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      bio: user.bio,
      references: user.references,
      company: user.company,
      address: user.address,
      socials: user.socials,
      isOrganizer: false,
      teams: [],
      notifications: [],
    });
  });

  it("returns user's teams", async () => {
    const user = await userFactory();
    const orga1 = await teamFactory({ attributes: { name: 'A' }, owners: [user] });
    const orga2 = await teamFactory({ attributes: { name: 'B' }, reviewers: [user] });
    const orga3 = await teamFactory({ attributes: { name: 'C' }, members: [user] });

    const response = await getUser(user.id);

    expect(response?.teams).toEqual([
      { slug: orga1.slug, name: 'A', role: TeamRole.OWNER },
      { slug: orga2.slug, name: 'B', role: TeamRole.REVIEWER },
      { slug: orga3.slug, name: 'C', role: TeamRole.MEMBER },
    ]);
  });

  it("returns  accepted proposals as user's notifications", async () => {
    const speaker1 = await userFactory();
    const speaker2 = await userFactory();
    const event = await eventFactory();
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker2] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker2] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['draft'] });

    const proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['accepted'],
      attributes: { emailAcceptedStatus: 'SENT' },
    });

    const response = await getUser(speaker1.id);

    expect(response?.notifications).toEqual([
      {
        type: 'ACCEPTED_PROPOSAL',
        proposal: {
          id: proposal.id,
          title: proposal.title,
        },
        event: {
          slug: proposal.event.slug,
          name: proposal.event.name,
        },
        date: proposal.updatedAt.toUTCString(),
      },
    ]);
  });

  it('is marked as organizer if user has an organizer key', async () => {
    const user = await userFactory({ isOrganizer: true });
    const result = await getUser(user.id);
    expect(result?.isOrganizer).toBe(true);
  });

  it('is marked as organizer if user belongs to an team', async () => {
    const user = await userFactory();
    await teamFactory({ members: [user] });
    const result = await getUser(user.id);
    expect(result?.isOrganizer).toBe(true);
  });

  it('is not marked as organizer if user does not have organizer key or teams', async () => {
    const user = await userFactory();
    const result = await getUser(user.id);
    expect(result?.isOrganizer).toBe(false);
  });

  it('returns null when user is not found', async () => {
    const response = await getUser('XXX');
    expect(response).toBeNull();
  });
});
