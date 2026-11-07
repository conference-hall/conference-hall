import { parseWithZod } from '@conform-to/zod/v4';
import { CheckIcon, ClipboardDocumentIcon, PlusIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { data, Form, href, useNavigation, useParams } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast, toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/submission-passes.ts';
import { SubmissionPassCreateSchema, SubmissionPassDeleteSchema } from './services/submission-passes.schema.server.ts';
import { SubmissionPasses } from './services/submission-passes.server.ts';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  return SubmissionPasses.for(authorizedEvent).list();
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);

  const i18n = getI18n(context);
  const form = await request.formData();
  const intent = form.get('intent');
  const passes = SubmissionPasses.for(authorizedEvent);

  switch (intent) {
    case 'create-pass': {
      const result = parseWithZod(form, { schema: SubmissionPassCreateSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      const { label } = await passes.create(result.value);
      const headers = await toastHeaders(
        'success',
        i18n.t('event-management.settings.submission-passes.feedbacks.created', { label }),
      );
      return data({ resetForm: true }, { headers });
    }
    case 'delete-pass': {
      const result = parseWithZod(form, { schema: SubmissionPassDeleteSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await passes.delete(result.value.id);
      return toast('success', i18n.t('event-management.settings.submission-passes.feedbacks.deleted'));
    }
  }

  return null;
};

export default function SubmissionPassesRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { unused, used } = loaderData;
  const resetForm = Boolean(actionData?.resetForm);
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === 'idle' && resetForm) formRef.current?.reset();
  }, [navigation.state, resetForm]);

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.submission-passes.heading')}</H2>
        <Subtitle>{t('event-management.settings.submission-passes.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form ref={formRef} method="POST" className="flex gap-2" preventScrollReset>
          <Input
            name="label"
            aria-label={t('event-management.settings.submission-passes.label')}
            placeholder={t('event-management.settings.submission-passes.label-placeholder')}
            className="flex-1"
            maxLength={100}
            required
            autoFocus
          />
          <Button type="submit" name="intent" value="create-pass" iconLeft={PlusIcon}>
            {t('event-management.settings.submission-passes.create')}
          </Button>
        </Form>

        {unused.length > 0 ? (
          <section className="space-y-2">
            <Text weight="semibold">{t('event-management.settings.submission-passes.unused.heading')}</Text>
            <List>
              <List.Content aria-label={t('event-management.settings.submission-passes.unused.heading')}>
                {unused.map((pass) => (
                  <List.Row key={pass.id} className="items-center justify-between gap-4 p-3">
                    <Text weight="medium">{pass.label}</Text>
                    <div className="flex gap-2">
                      <CopyLinkButton link={pass.link} />
                      <DeletePassButton id={pass.id} label={pass.label} />
                    </div>
                  </List.Row>
                ))}
              </List.Content>
            </List>
          </section>
        ) : null}

        {used.length > 0 ? (
          <section className="space-y-2">
            <Text weight="semibold">{t('event-management.settings.submission-passes.used.heading')}</Text>
            <List>
              <List.Content aria-label={t('event-management.settings.submission-passes.used.heading')}>
                {used.map((pass) => (
                  <List.Row key={pass.id} className="items-center justify-between gap-4 p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={pass.holder.name} picture={pass.holder.picture} size="s" />
                      <div>
                        <HolderName holder={pass.holder} />
                        <Text variant="secondary" size="xs">
                          {pass.label}
                        </Text>
                      </div>
                    </div>
                    <DeletePassButton id={pass.id} label={pass.label} />
                  </List.Row>
                ))}
              </List.Content>
            </List>
          </section>
        ) : null}
      </Card.Content>
    </Card>
  );
}

function HolderName({ holder }: { holder: { name: string; eventSpeakerId: string | null } }) {
  const params = useParams();
  if (!holder.eventSpeakerId || !params.team || !params.event) return <Text weight="medium">{holder.name}</Text>;
  return (
    <Link
      to={href('/team/:team/:event/speakers/:speaker', {
        team: params.team,
        event: params.event,
        speaker: holder.eventSpeakerId,
      })}
      weight="medium"
    >
      {holder.name}
    </Link>
  );
}

function CopyLinkButton({ link }: { link: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      iconLeft={copied ? CheckIcon : ClipboardDocumentIcon}
      onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))}
    >
      {copied ? t('common.copied') : t('event-management.settings.submission-passes.copy-link')}
    </Button>
  );
}

function DeletePassButton({ id, label }: { id: string; label: string }) {
  const { t } = useTranslation();
  return (
    <Form
      method="POST"
      preventScrollReset
      onSubmit={(event) => {
        if (!confirm(t('event-management.settings.submission-passes.confirm-delete', { label }))) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" name="intent" value="delete-pass" variant="important" size="sm">
        {t('common.delete')}
      </Button>
    </Form>
  );
}
