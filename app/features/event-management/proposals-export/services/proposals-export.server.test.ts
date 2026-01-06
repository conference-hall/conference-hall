import type { Event, EventCategory, EventFormat, EventProposalTag, Team, User } from 'prisma/generated/client.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';
import { ProposalsExport } from './proposals-export.server.ts';

describe('ProposalsExport', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;
  let tag: EventProposalTag;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team, traits: ['withIntegration', 'withSurveyConfig'] });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    tag = await eventProposalTagFactory({ event });
  });

  describe('ProposalsExport.forUser', () => {
    it('returns a ProposalsExport instance', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const proposalsExport = ProposalsExport.forUser(authorizedEvent);
      expect(proposalsExport).toBeInstanceOf(ProposalsExport);
    });

    it('throws an error if user is not owner', async () => {
      const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      expect(() => ProposalsExport.forUser(authorizedEvent)).toThrowError(ForbiddenOperationError);
    });
  });

  describe('ProposalsExport.forApi', () => {
    it('returns a ProposalsExport instance', async () => {
      const proposalsExport = ProposalsExport.forApi({ event });
      expect(proposalsExport).toBeInstanceOf(ProposalsExport);
    });
  });

  describe('toJson', () => {
    it('export reviews to json', async () => {
      const eventSpeaker = await eventSpeakerFactory({ event, user: speaker });
      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        tags: [tag],
        talk: await talkFactory({ speakers: [speaker] }),
      });
      const review = await reviewFactory({ proposal, user: speaker });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const result = await ProposalsExport.forUser(authorizedEvent).toJson({});

      expect(result).toEqual({
        name: event.name,
        startDate: event.conferenceStart,
        endDate: event.conferenceEnd,
        proposals: [
          {
            id: proposal.id,
            proposalNumber: proposal.proposalNumber,
            title: proposal.title,
            deliberationStatus: proposal.deliberationStatus,
            confirmationStatus: proposal.confirmationStatus,
            publicationStatus: proposal.publicationStatus,
            abstract: proposal.abstract,
            languages: proposal.languages,
            references: proposal.references,
            level: proposal.level,
            formats: [format.name],
            categories: [category.name],
            tags: [tag.name],
            review: { negatives: 0, positives: 0, average: review.note },
            speakers: [
              {
                id: eventSpeaker.id,
                name: eventSpeaker.name,
                email: eventSpeaker.email,
                bio: eventSpeaker.bio,
                picture: eventSpeaker.picture,
                company: eventSpeaker.company,
                location: eventSpeaker.location,
                references: eventSpeaker.references,
                socialLinks: eventSpeaker.socialLinks,
                survey: [],
              },
            ],
          },
        ],
      });
    });

    it('can filters proposals like in the proposals search', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, traits: ['accepted'], talk });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const result = await ProposalsExport.forUser(authorizedEvent).toJson({ status: 'accepted' });

      expect(result.proposals.length).toBe(1);
      expect(result.proposals[0].id).toBe(proposal.id);
    });

    it('includes speaker survey data when available', async () => {
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      await surveyFactory({
        user: speaker1,
        event,
        attributes: { answers: { accomodation: 'yes', transports: ['taxi', 'train'], info: 'Hello' } },
      });
      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const result = await ProposalsExport.forUser(authorizedEvent).toJson({});

      expect(result.proposals[0].speakers).toHaveLength(2);

      const speakerWithoutSurvey = result.proposals[0].speakers.find((s) => s.name === speaker2.name);
      const speakerWithSurvey = result.proposals[0].speakers.find((s) => s.name === speaker1.name);

      expect(speakerWithoutSurvey?.survey).toEqual([]);
      expect(speakerWithSurvey?.survey).toEqual([
        {
          id: 'accomodation',
          question: 'Do you need accommodation funding? (Hotel, AirBnB...)',
          answer: 'Yes',
        },
        {
          id: 'transports',
          question: 'Do you need transports funding?',
          answer: ['Taxi', 'Train'],
        },
        {
          id: 'info',
          question: 'Do you have specific information to share?',
          answer: 'Hello',
        },
      ]);
    });

    it('does not include survey data when survey is disabled for event', async () => {
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const event = await eventFactory({ team, attributes: { surveyConfig: { enabled: false, questions: [] } } });

      await surveyFactory({
        user: speaker1,
        event,
        attributes: { answers: { accomodation: 'yes' } },
      });

      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const result = await ProposalsExport.forUser(authorizedEvent).toJson({});

      result.proposals[0].speakers.forEach((speaker) => {
        expect(speaker.survey).toEqual([]);
      });
    });
  });

  describe('toCards', () => {
    it('export a proposal', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      const result = await ProposalsExport.forUser(authorizedEvent).toCards({});

      expect(result).toEqual([
        {
          id: proposal.id,
          proposalNumber: proposal.proposalNumber,
          title: proposal.title,
          languages: proposal.languages,
          level: proposal.level,
          categories: [],
          formats: [],
          reviews: {
            negatives: 0,
            positives: 0,
            average: null,
          },
          speakers: [speaker.name],
        },
      ]);
    });
  });

  describe('toOpenPlanner', () => {
    it('triggers job to export sessions and speakers to OpenPlanner', async () => {
      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
      const exports = ProposalsExport.forUser(authorizedEvent);

      await exports.toOpenPlanner({});

      expect(exportToOpenPlanner.trigger).toHaveBeenCalledWith({
        userId: owner.id,
        eventId: event.id,
        filters: {},
      });
    });
  });
});
