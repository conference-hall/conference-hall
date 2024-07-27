import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

import { ButtonLink } from '~/design-system/buttons.tsx';

type Props = { talkId: string };

export function TalkSubmitButton({ talkId }: Props) {
  return (
    <ButtonLink to={{ pathname: '/', search: `?talkId=${talkId}` }} iconLeft={PaperAirplaneIcon}>
      Submit
    </ButtonLink>
  );
}
