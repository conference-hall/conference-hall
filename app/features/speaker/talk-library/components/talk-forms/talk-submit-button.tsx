import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '~/design-system/buttons.tsx';

type Props = { talkId: string };

export function TalkSubmitButton({ talkId }: Props) {
  const { t } = useTranslation();
  return (
    <ButtonLink to={{ pathname: '/', search: `?talkId=${talkId}` }} iconLeft={PaperAirplaneIcon}>
      {t('common.submit')}
    </ButtonLink>
  );
}
