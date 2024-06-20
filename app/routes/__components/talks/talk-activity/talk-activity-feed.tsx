import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';

import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { H2, Text } from '~/design-system/Typography';
import type { SpeakerProposalStatus } from '~/types/speaker.types';

import { TalkSubmissionItem } from './talk-submission-item';

type Props = {
  talkId: string;
  canSubmit: boolean;
  submissions: Array<{ slug: string; name: string; timestamp: string; proposalStatus: SpeakerProposalStatus }>;
};

export function TalkActivityFeed({ talkId, canSubmit, submissions }: Props) {
  if (submissions.length <= 0) return null;

  return (
    <Card>
      <div className="flex items-center p-4 lg:px-6">
        <H2>Application history</H2>
      </div>
      <ul aria-label="Activity feed" className="p-4 pb-6 lg:px-6 space-y-4">
        {submissions.length > 0 ? (
          submissions.map((item, index) => (
            <li key={item.slug} className="relative flex gap-x-3">
              {index !== 0 && <FeedLine last={index === submissions.length - 1} />}
              <TalkSubmissionItem {...item} />
            </li>
          ))
        ) : (
          <li>
            <Text variant="secondary" size="s">
              No applications yet.
            </Text>
          </li>
        )}
      </ul>
      {canSubmit && (
        <div className="border-t border-t-gray-200 p-4 lg:px-6">
          <ButtonLink iconLeft={PaperAirplaneIcon} to={{ pathname: '/', search: `?talkId=${talkId}` }} block>
            Submit to event
          </ButtonLink>
        </div>
      )}
    </Card>
  );
}

function FeedLine({ last }: { last: boolean }) {
  return (
    <div className={cx(last ? 'h-12' : '-bottom-8', 'absolute left-0 -top-10 flex w-6 justify-center')}>
      <div className="w-px bg-gray-300" />
    </div>
  );
}
