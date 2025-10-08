import { parseWithZod } from '@conform-to/zod/v4';
import { useTranslation } from 'react-i18next';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/talk.ts';
import { TalkArchiveButton } from './components/talk-forms/talk-archive-button.tsx';
import { TalkEditButton } from './components/talk-forms/talk-form-drawer.tsx';
import { TalkSubmitButton } from './components/talk-forms/talk-submit-button.tsx';
import { TalkSection } from './components/talk-section.tsx';
import { TalkSubmissionsSection } from './components/talk-submissions-section.tsx';
import { TalkSaveSchema } from './services/talks-library.schema.server.ts';
import { TalksLibrary } from './services/talks-library.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `${args.data?.title} | Conference Hall` }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return TalksLibrary.of(userId).talk(params.talk).get();
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getI18n(context);
  const talk = TalksLibrary.of(userId).talk(params.talk);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'archive-talk': {
      await talk.archive();
      return toast('success', i18n.t('talk.feedbacks.archived'));
    }
    case 'restore-talk': {
      await talk.restore();
      return toast('success', i18n.t('talk.feedbacks.restored'));
    }
    case 'remove-speaker': {
      await talk.removeCoSpeaker(form.get('_speakerId')?.toString() as string);
      return toast('success', i18n.t('talk.feedbacks.co-speaker-removed'));
    }
    case 'edit-talk': {
      const result = parseWithZod(form, { schema: TalkSaveSchema });
      if (result.status !== 'success') return result.error;
      await talk.update(result.value);
      return toast('success', i18n.t('talk.feedbacks.updated'));
    }
    default:
      return null;
  }
};

export default function SpeakerTalkRoute({ loaderData: talk, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <Page>
      <H1 srOnly>{t('talk.page.heading')}</H1>

      <div className="space-y-6">
        <TalkSection
          talk={talk}
          actions={
            <div className="flex flex-row sm:justify-between items-center gap-3">
              <TalkArchiveButton archived={Boolean(talk.archived)} />
              {!talk.archived && <TalkEditButton initialValues={talk} errors={errors} />}
              {!talk.archived && <TalkSubmitButton talkId={talk.id} />}
            </div>
          }
          canEditSpeakers
          showSpeakers
        />

        {talk.submissions.length > 0 ? <TalkSubmissionsSection submissions={talk.submissions} /> : null}
      </div>
    </Page>
  );
}
