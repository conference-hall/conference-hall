import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { BadgeDot } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { Checkbox } from '~/design-system/forms/checkboxes.tsx';
import { H2 } from '~/design-system/typography.tsx';
import type { DeliberationStatus, PublicationStatus } from '~/types/proposals.types.ts';

type Props = { deliberationStatus: DeliberationStatus; publicationStatus: PublicationStatus };

export function PublicationDetails({ deliberationStatus, publicationStatus }: Props) {
  const { t } = useTranslation();

  if (deliberationStatus === 'PENDING') return null;
  if (deliberationStatus === 'ACCEPTED' && publicationStatus === 'PUBLISHED') return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">{t('common.publication')}</H2>
      <PublicationLabel deliberationStatus={deliberationStatus} publicationStatus={publicationStatus} />
    </div>
  );
}

function PublicationLabel({ publicationStatus }: Props) {
  const { t } = useTranslation();

  if (publicationStatus === 'PUBLISHED') {
    return <BadgeDot color="green">{t('event-management.proposal-page.publication.published')}</BadgeDot>;
  } else if (publicationStatus === 'NOT_PUBLISHED') {
    return (
      <Form method="POST" className="space-y-4">
        <BadgeDot color="gray">{t('event-management.proposal-page.publication.not-published')}</BadgeDot>
        <Checkbox id="send-email" name="send-email">
          {t('event-management.proposal-page.publication.notify')}
        </Checkbox>
        <Button type="submit" name="intent" value="publish-results" variant="secondary" block>
          {t('event-management.proposal-page.publication.submit')}
        </Button>
      </Form>
    );
  }
}
