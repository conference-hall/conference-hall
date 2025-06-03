import { parseWithZod } from '@conform-to/zod';
import { useTranslation } from 'react-i18next';
import { TalksLibrary } from '~/.server/speaker-talks-library/talks-library.ts';
import { TalkSaveSchema } from '~/.server/speaker-talks-library/talks-library.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { TalkSection } from '../components/talks/talk-section.tsx';
import { TalkSubmissionsSection } from '../components/talks/talk-submissions-section.tsx';
import type { Route } from './+types/talks.$talk.index.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: `${args.data?.title} | Conference Hall` }]);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return TalksLibrary.of(userId).talk(params.talk).get();
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const talk = TalksLibrary.of(userId).talk(params.talk);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'archive-talk': {
      await talk.archive();
      return toast('success', t('talk.feedbacks.archived'));
    }
    case 'restore-talk': {
      await talk.restore();
      return toast('success', t('talk.feedbacks.restored'));
    }
    case 'remove-speaker': {
      await talk.removeCoSpeaker(form.get('_speakerId')?.toString() as string);
      return toast('success', t('talk.feedbacks.co-speaker-removed'));
    }
    case 'edit-talk': {
      const result = parseWithZod(form, { schema: TalkSaveSchema });
      if (result.status !== 'success') return result.error;
      await talk.update(result.value);
      return toast('success', t('talk.feedbacks.updated'));
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
          errors={errors}
          canEditSpeakers
          canArchive
          canEditTalk
          canSubmitTalk={!talk.archived}
          showBackButton
        />

        {talk.submissions.length > 0 ? <TalkSubmissionsSection submissions={talk.submissions} /> : null}
      </div>
    </Page>
  );
}
