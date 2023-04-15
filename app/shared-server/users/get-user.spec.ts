import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { getUser } from './get-user.server';
import { OrganizationRole } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';

describe('#getUser', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default response', async () => {
    const user = await userFactory();

    const response = await getUser(user.id);
    expect(response).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      bio: user.bio,
      references: user.references,
      company: user.company,
      address: user.address,
      twitter: user.twitter,
      github: user.github,
      isOrganizer: false,
      organizations: [],
      notifications: [],
    });
  });

  it("returns user's organizations", async () => {
    const user = await userFactory();
    const orga1 = await organizationFactory({ attributes: { name: 'A' }, owners: [user] });
    const orga2 = await organizationFactory({ attributes: { name: 'B' }, reviewers: [user] });
    const orga3 = await organizationFactory({ attributes: { name: 'C' }, members: [user] });

    const response = await getUser(user.id);

    expect(response?.organizations).toEqual([
      { slug: orga1.slug, name: 'A', role: OrganizationRole.OWNER },
      { slug: orga2.slug, name: 'B', role: OrganizationRole.REVIEWER },
      { slug: orga3.slug, name: 'C', role: OrganizationRole.MEMBER },
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

  it('is marked as organizer if user belongs to an organization', async () => {
    const user = await userFactory();
    await organizationFactory({ members: [user] });
    const result = await getUser(user.id);
    expect(result?.isOrganizer).toBe(true);
  });

  it('is not marked as organizer if user does not have organizer key or organizations', async () => {
    const user = await userFactory();
    const result = await getUser(user.id);
    expect(result?.isOrganizer).toBe(false);
  });

  it('returns null when user is not found', async () => {
    const response = await getUser('XXX');
    expect(response).toBeNull();
  });
});
