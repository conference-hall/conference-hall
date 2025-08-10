import { parseWithZod } from '@conform-to/zod/v4';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, Link, redirect } from 'react-router';
import { AvatarName } from '~/design-system/avatar.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import { SelectPanel } from '~/design-system/forms/select-panel.tsx';
import { PencilSquareMicroIcon } from '~/design-system/icons/pencil-square-micro-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { menuItem } from '~/design-system/styles/menu.styles.ts';
import { Tag } from '~/design-system/tag.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { TalkForm } from '~/features/speaker/talk-library/components/talk-forms/talk-form.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { useFlag } from '~/shared/feature-flags/flags-context.tsx';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';
import type { Route } from './+types/new-proposal.ts';
import { SpeakersSelectPanel } from './components/new-proposal/speakers-select-panel.tsx';
import { TalkProposalCreationSchema } from './services/proposal-creation.schema.server.ts';
import { ProposalCreation } from './services/proposal-creation.server.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: TalkProposalCreationSchema });
  if (result.status !== 'success') return { errors: result.error }; // todo(proposal): display errors

  try {
    const proposal = await ProposalCreation.for(userId, params.team, params.event).create(result.value);
    const headers = await toastHeaders('success', t('event-management.proposals.new.feedbacks.created'));
    return redirect(href('/team/:team/:event/reviews/:proposal', { ...params, proposal: proposal.id }), { headers });
  } catch (_error) {
    return { errors: { form: t('error.global') } };
  }
};

// todo(proposal): make it responsive
// todo(proposal): fully translate
export default function NewProposalRoute({ actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const isFeatureEnabled = useFlag('organizerProposalCreation');
  const { team, event } = useCurrentEventTeam();

  const [speakers, setSpeakers] = useState<Array<{ id: string; name: string; picture?: string | null }>>([]);
  const [tags, setTags] = useState<Array<TagType>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [formats, setFormats] = useState<Array<{ id: string; name: string }>>([]);

  if (!isFeatureEnabled || !team.userPermissions?.canCreateEventProposal) {
    return null;
  }

  return (
    <Page>
      <Page.Heading
        title={t('event-management.proposals.new.title')}
        subtitle={t('event-management.proposals.new.subtitle')}
        backTo={href('/team/:team/:event/reviews', params)}
      />

      <p>{JSON.stringify(actionData?.errors)}</p>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <Card.Content>
            <TalkForm id="new-proposal-form" errors={actionData?.errors} />
          </Card.Content>

          <Card.Actions>
            <ButtonLink variant="secondary" to={href('/team/:team/:event/reviews', params)}>
              {t('common.cancel')}
            </ButtonLink>
            <Button type="submit" form="new-proposal-form">
              {t('common.submit')}
            </Button>
          </Card.Actions>
        </Card>

        <div className="space-y-4">
          <Card as="section" className="py-2">
            <div className="space-y-3 p-4 lg:px-6">
              <SpeakersSelectPanel
                team={params.team}
                event={params.event}
                form="new-proposal-form"
                name="speakers"
                onChange={setSpeakers}
              />
              <div className="flex flex-col gap-2">
                {speakers.length === 0 ? <Text size="xs">No speakers</Text> : null}

                {speakers.map((speaker) => (
                  <AvatarName key={speaker.id} picture={speaker.picture} name={speaker.name} size="xs" />
                ))}
              </div>
            </div>

            <Divider />

            <div className="space-y-2.5 p-4 lg:px-6">
              <SelectPanel
                name="formats"
                form="new-proposal-form"
                label="Formats"
                defaultValue={formats.map((format) => format.id)}
                options={event.formats.map((format) => ({ value: format.id, label: format.name }))}
                onChange={(selectedFormats) => {
                  setFormats(selectedFormats.map((option) => ({ id: option.value, name: option.label })));
                }}
                footer={<SelectPanelFooter to="../../settings/tracks" label="Gérer les formats" />}
              >
                <div className="flex items-center justify-between group">
                  <H2 size="s" className="group-hover:text-indigo-600">
                    Formats
                  </H2>
                  <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
                </div>
              </SelectPanel>
              <div className="flex flex-wrap gap-2">
                {formats.length === 0 ? <Text size="xs">No formats</Text> : null}

                {formats.map((format) => (
                  <Badge key={format.id}>{format.name}</Badge>
                ))}
              </div>
            </div>

            <Divider />

            <div className="space-y-2.5 p-4 lg:px-6">
              <SelectPanel
                name="categories"
                form="new-proposal-form"
                label="Categories"
                defaultValue={categories.map((category) => category.id)}
                options={event.categories.map((category) => ({ value: category.id, label: category.name }))}
                onChange={(selectedCategories) => {
                  setCategories(selectedCategories.map((option) => ({ id: option.value, name: option.label })));
                }}
                footer={<SelectPanelFooter to="../../settings/tracks" label="Gérer les catégories" />}
                multiple={false}
              >
                <div className="flex items-center justify-between group">
                  <H2 size="s" className="group-hover:text-indigo-600">
                    Categories
                  </H2>
                  <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
                </div>
              </SelectPanel>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 ? <Text size="xs">No categories</Text> : null}

                {categories.map((category) => (
                  <Badge key={category.id}>{category.name}</Badge>
                ))}
              </div>
            </div>

            <Divider />

            <div className="space-y-2.5 p-4 lg:px-6">
              <SelectPanel
                name="tags"
                form="new-proposal-form"
                label={t('common.tags-list.label')}
                defaultValue={tags.map((tag) => tag.id)}
                options={event.tags.map((tag) => ({ value: tag.id, label: tag.name, color: tag.color }))}
                onChange={(selectedTags) => {
                  setTags(
                    selectedTags.map((option) => event.tags.find((tag) => tag.id === option.value)!).filter(Boolean),
                  );
                }}
                footer={<SelectPanelFooter to="../../settings/tags" label={t('common.tags-list.manage')} />}
              >
                <div className="flex items-center justify-between group">
                  <H2 size="s" className="group-hover:text-indigo-600">
                    {t('common.tags')}
                  </H2>
                  <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
                </div>
              </SelectPanel>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? <Text size="xs">{t('event-management.proposal-page.no-tags')}</Text> : null}

                {tags.map((tag) => (
                  <Tag key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

type SelectPanelFooterProps = { to: string; label: string };

function SelectPanelFooter({ to, label }: SelectPanelFooterProps) {
  return (
    <Link to={to} relative="path" className={cx('text-s hover:bg-gray-100', menuItem())}>
      <PencilSquareMicroIcon className="text-gray-400" />
      {label}
    </Link>
  );
}
