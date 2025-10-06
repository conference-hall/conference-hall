import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageInputForm } from '../../communication/message-input-form.tsx';

export function CommentFormEntry() {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <ActivityFeed.Entry marker={<Avatar picture={user?.picture} name={user?.name} />}>
      <MessageInputForm
        name="message"
        intent="add-comment"
        channel="ORGANIZER"
        inputLabel={t('event-management.proposal-page.comment.label')}
        buttonLabel={t('event-management.proposal-page.comment.submit')}
        placeholder={t('event-management.proposal-page.comment.placeholder')}
      />
    </ActivityFeed.Entry>
  );
}
