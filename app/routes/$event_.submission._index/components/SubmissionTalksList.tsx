import { ProposalCard } from '~/shared-components/proposals/ProposalCard';

type Props = {
  talks: Array<{
    id: string;
    title: string;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
};

export function SubmissionTalksList({ talks }: Props) {
  return (
    <ul aria-label="Talks list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <ProposalCard key={talk.id} {...talk} />
      ))}
    </ul>
  );
}
