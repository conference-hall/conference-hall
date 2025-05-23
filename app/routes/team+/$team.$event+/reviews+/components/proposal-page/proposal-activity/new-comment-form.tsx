import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useNavigation } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { useUser } from '~/routes/components/contexts/user-context.tsx';

type Props = { compact?: boolean; className?: string };

export function NewCommentForm({ compact = false, className }: Props) {
  const { t } = useTranslation();
  const user = useUser();

  const navigation = useNavigation();
  const isAdding = navigation.state === 'submitting';
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAdding) formRef.current?.reset();
  }, [isAdding]);

  return (
    <div className={className}>
      {!compact && <Avatar picture={user?.picture} name={user?.name} size="xs" />}

      <Form ref={formRef} method="POST" className="relative flex-auto">
        <input type="hidden" name="intent" value="add-comment" />

        <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-xs ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600">
          <textarea
            id="comment"
            name="comment"
            rows={compact ? 1 : 2}
            className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm leading-6"
            placeholder={t('event-management.proposal-page.comment.placeholder')}
            aria-label={t('event-management.proposal-page.comment.label')}
            defaultValue=""
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
          <Button type="submit" variant="secondary" size={compact ? 's' : 'm'}>
            {t('event-management.proposal-page.comment.submit')}
          </Button>
        </div>
      </Form>
    </div>
  );
}
