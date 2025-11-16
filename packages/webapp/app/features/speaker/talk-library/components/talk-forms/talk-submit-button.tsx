import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';

type Props = { talkId: string };

export function TalkSubmitButton({ talkId }: Props) {
  const { t } = useTranslation();
  return (
    <Button to={{ pathname: '/', search: `?talkId=${talkId}` }} iconLeft={PaperAirplaneIcon}>
      {t('common.submit')}
    </Button>
  );
}
