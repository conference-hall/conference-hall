import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { ProposalNotFoundError } from '~/libs/errors';
import { SpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status';

import { SpeakerProposal } from './SpeakerProposal';

describe('SpeakerProposal', () => {
  describe('#get', () => {
    it('returns event proposals of the speaker', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });

      const result = await SpeakerProposal.for(speaker.id, proposal.id).get();

      expect(result).toEqual({
        id: proposal.id,
        talkId: proposal.talkId,
        title: proposal.title,
        abstract: proposal.abstract,
        references: proposal.references,
        level: proposal.level,
        createdAt: proposal.createdAt.toUTCString(),
        languages: proposal.languages,
        invitationLink: `http://localhost:3001/invite/proposal/${proposal.invitationCode}`,
        status: SpeakerProposalStatus.Submitted,
        formats: [{ id: format.id, name: format.name }],
        categories: [{ id: category.id, name: category.name }],
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
            company: speaker.company,
            isOwner: true,
          },
        ],
      });
    });

    it('throws an error when proposal does not exist', async () => {
      const speaker = await userFactory();

      const speakerProposal = SpeakerProposal.for(speaker.id, 'XXX');
      await expect(speakerProposal.get()).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error when proposal does not belong to the user', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const otherSpeaker = await userFactory();
      const talk = await talkFactory({ speakers: [otherSpeaker] });
      const proposal = await proposalFactory({ event, talk });

      const speakerProposal = SpeakerProposal.for(speaker.id, proposal.id);
      await expect(speakerProposal.get()).rejects.toThrowError(ProposalNotFoundError);
    });
  });
});
