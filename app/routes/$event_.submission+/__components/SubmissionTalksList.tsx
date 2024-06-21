import { ProposalCard } from '~/routes/__components/proposals/proposal-card';

type Props = {
  label: string;
  talks: Array<{
    id: string;
    title: string;
    speakers: Array<{
      id: string;
      name: string | null;
      picture?: string | null;
    }>;
  }>;
};

export function SubmissionTalksList({ label, talks }: Props) {
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2">
      {talks.map((talk) => (
        <ProposalCard key={talk.id} {...talk} />
      ))}
    </ul>
  );
}
