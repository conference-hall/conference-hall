import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventProposalsApi } from './proposals-api.server.ts';

describe('#EventProposalsApi', () => {
  describe('#proposals', () => {
    it('return proposals from api', async () => {
      const speaker = await userFactory();
      const event = await eventFactory({ attributes: { apiKey: '123' }, traits: ['conference'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const tag = await eventProposalTagFactory({ event });

      const proposal = await proposalFactory({
        event,
        formats: [format],
        categories: [category],
        tags: [tag],
        talk: await talkFactory({ speakers: [speaker], attributes: { level: 'BEGINNER', languages: ['fr'] } }),
        traits: ['confirmed'],
      });
      const review = await reviewFactory({ proposal, user: speaker });

      const result = await EventProposalsApi.proposals(event, {});

      expect(result).toEqual({
        startDate: event.conferenceStart,
        endDate: event.conferenceEnd,
        name: event.name,
        proposals: [
          {
            id: proposal.id,
            proposalNumber: proposal.proposalNumber,
            title: proposal.title,
            abstract: proposal.abstract,
            level: 'BEGINNER',
            references: proposal.references,
            formats: [format.name],
            categories: [category.name],
            tags: [tag.name],
            deliberationStatus: 'ACCEPTED',
            publicationStatus: 'PUBLISHED',
            confirmationStatus: 'CONFIRMED',
            languages: ['fr'],
            speakers: [
              expect.objectContaining({
                id: expect.any(String),
                name: speaker.name,
                bio: speaker.bio,
                company: speaker.company,
                references: speaker.references,
                location: speaker.location,
                picture: speaker.picture,
                email: speaker.email,
                socialLinks: speaker.socialLinks,
                survey: [],
              }),
            ],
            review: {
              average: review.note,
              positives: 0,
              negatives: 0,
            },
          },
        ],
      });
    });

    it('can filters proposals like in the proposals search', async () => {
      const speaker = await userFactory();
      const event = await eventFactory({ attributes: { apiKey: '123' } });

      const proposal = await proposalFactory({
        event,
        traits: ['accepted'],
        talk: await talkFactory({ speakers: [speaker] }),
      });

      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

      const result = await EventProposalsApi.proposals(event, { status: 'accepted' });

      expect(result.proposals.length).toBe(1);
      expect(result.proposals[0].title).toBe(proposal.title);
    });

    it('includes speaker survey data when available', async () => {
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const event = await eventFactory({
        traits: ['withSurveyConfig'],
        attributes: {
          apiKey: '123',
          surveyConfig: {
            enabled: true,
            questions: [
              {
                id: 'question1',
                label: 'What is your experience level?',
                type: 'radio',
                required: true,
                options: [
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'intermediate', label: 'Intermediate' },
                  { id: 'expert', label: 'Expert' },
                ],
              },
            ],
          },
        },
      });

      await surveyFactory({
        user: speaker1,
        event,
        attributes: {
          answers: { question1: 'expert' },
        },
      });

      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      });

      const result = await EventProposalsApi.proposals(event, {});

      expect(result.proposals[0].speakers).toHaveLength(2);

      const speakerWithSurvey = result.proposals[0].speakers.find((s) => s.name === speaker1.name);
      const speakerWithoutSurvey = result.proposals[0].speakers.find((s) => s.name === speaker2.name);

      expect(speakerWithSurvey?.survey).toEqual([
        {
          id: 'question1',
          question: 'What is your experience level?',
          answer: 'Expert',
        },
      ]);
      expect(speakerWithoutSurvey?.survey).toEqual([]);
    });

    it('efficiently fetches surveys for multiple proposals and speakers', async () => {
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const speaker3 = await userFactory();
      const event = await eventFactory({
        traits: ['withSurveyConfig'],
        attributes: {
          apiKey: '123',
          surveyConfig: {
            enabled: true,
            questions: [
              {
                id: 'question1',
                label: 'Experience level?',
                type: 'radio',
                required: true,
                options: [
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'expert', label: 'Expert' },
                ],
              },
            ],
          },
        },
      });

      await surveyFactory({
        user: speaker1,
        event,
        attributes: { answers: { question1: 'expert' } },
      });

      await surveyFactory({
        user: speaker3,
        event,
        attributes: { answers: { question1: 'beginner' } },
      });

      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      });

      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker3] }),
      });

      const result = await EventProposalsApi.proposals(event, {});

      expect(result.proposals).toHaveLength(2);

      const proposal1 = result.proposals.find((p) => p.speakers.some((s) => s.name === speaker1.name));
      const proposal2 = result.proposals.find((p) => p.speakers.some((s) => s.name === speaker3.name));

      const speaker1InProposal = proposal1?.speakers.find((s) => s.name === speaker1.name);
      const speaker2InProposal = proposal1?.speakers.find((s) => s.name === speaker2.name);
      const speaker3InProposal = proposal2?.speakers.find((s) => s.name === speaker3.name);

      expect(speaker1InProposal?.survey).toEqual([
        { id: 'question1', question: 'Experience level?', answer: 'Expert' },
      ]);
      expect(speaker2InProposal?.survey).toEqual([]);
      expect(speaker3InProposal?.survey).toEqual([
        { id: 'question1', question: 'Experience level?', answer: 'Beginner' },
      ]);
    });

    it('does not include survey data when survey is disabled for event', async () => {
      const speaker1 = await userFactory();
      const speaker2 = await userFactory();
      const event = await eventFactory({
        attributes: {
          apiKey: '123',
          surveyConfig: {
            enabled: false,
            questions: [],
          },
        },
      });

      await surveyFactory({
        user: speaker1,
        event,
        attributes: {
          answers: { question1: 'expert' },
        },
      });

      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker1, speaker2] }),
      });

      const result = await EventProposalsApi.proposals(event, {});

      result.proposals[0].speakers.forEach((speaker) => {
        expect(speaker.survey).toEqual([]);
      });
    });

    it('maps different survey question types correctly', async () => {
      const speaker = await userFactory();
      const event = await eventFactory({
        traits: ['withSurveyConfig'],
        attributes: {
          apiKey: '123',
          surveyConfig: {
            enabled: true,
            questions: [
              {
                id: 'name',
                label: 'What is your name?',
                type: 'text',
                required: true,
              },
              {
                id: 'experience',
                label: 'What is your experience level?',
                type: 'radio',
                required: true,
                options: [
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'expert', label: 'Expert' },
                ],
              },
              {
                id: 'interests',
                label: 'What are your interests?',
                type: 'checkbox',
                required: true,
                options: [
                  { id: 'frontend', label: 'Frontend' },
                  { id: 'backend', label: 'Backend' },
                  { id: 'devops', label: 'DevOps' },
                ],
              },
            ],
          },
        },
      });

      await surveyFactory({
        user: speaker,
        event,
        attributes: { answers: { name: 'John Doe', experience: 'expert', interests: ['frontend', 'devops'] } },
      });

      await proposalFactory({
        event,
        talk: await talkFactory({ speakers: [speaker] }),
      });

      const result = await EventProposalsApi.proposals(event, {});

      expect(result.proposals[0].speakers[0].survey).toEqual([
        { id: 'name', question: 'What is your name?', answer: 'John Doe' },
        { id: 'experience', question: 'What is your experience level?', answer: 'Expert' },
        { id: 'interests', question: 'What are your interests?', answer: ['Frontend', 'DevOps'] },
      ]);
    });
  });
});
