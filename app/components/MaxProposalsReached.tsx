import { ButtonLink } from '../design-system/Buttons';

type Props = { maxProposals: number };

export function MaxProposalsReached({ maxProposals }: Props) {
  return (
    <div className="py-8 text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        You have submitted the maximum of proposals for the event. Thanks!
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {`The event has a maximum of ${maxProposals} proposals submitted by speakers.`}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        If you want to submit an other proposal, you can remove a submitted one.
      </p>
      <div className="mt-12">
        <ButtonLink to="proposals" variant="secondary">
          Check my submitted proposals
        </ButtonLink>
      </div>
    </div>
  );
}
