import { useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import { AdminFlags } from '~/.server/admin/admin-flags.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Badge } from '~/shared/design-system/badges.tsx';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { Toggle } from '~/shared/design-system/forms/toggles.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { H1, Text } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/feature-flags.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const adminFlags = await AdminFlags.for(userId);
  const flags = await adminFlags.list();
  return flags;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const formData = await request.formData();
  const key = formData.get('key') as string;
  const value = formData.get('value') as string;
  const adminFlags = await AdminFlags.for(userId);
  await adminFlags.update(key, value);
  return null;
};

export default function AdminFlagsRoute({ loaderData: flags }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <Page>
      <H1 srOnly>{t('admin.nav.flags')}</H1>
      <List>
        <List.Header>
          <Text weight="semibold">{`${flags.length} feature flags`}</Text>
        </List.Header>

        <List.Content aria-label={t('admin.flags.list')}>
          {flags.map((flag) => (
            <List.Row key={flag.key} className="flex items-start justify-between px-6 py-4 gap-2">
              <div>
                <Text as="pre" weight="semibold">
                  {flag.key}
                </Text>
                <div className="flex gap-2">
                  <Text variant="secondary">{flag.description}</Text>
                  {flag.tags.map((tag) => (
                    <Badge key={tag} compact>
                      <pre>{tag}</pre>
                    </Badge>
                  ))}
                </div>
              </div>
              {flag.type === 'boolean' ? <FlagToggle flag={flag} /> : <FlagInput flag={flag} />}
            </List.Row>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}

type FlagInputProps = { flag: { key: string; value: boolean | number | string | undefined; type: string | undefined } };

function FlagInput({ flag }: FlagInputProps) {
  const { t } = useTranslation();
  const inputType = flag.type === 'number' ? 'number' : 'text';
  return (
    <Form method="post" className="flex gap-2">
      <input type="hidden" name="key" value={flag.key} />
      <Input type={inputType} name="value" defaultValue={String(flag.value)} />
      <Button type="submit">{t('common.save')}</Button>
    </Form>
  );
}

type FlagToggleProps = { flag: { key: string; value: boolean | number | string } };

function FlagToggle({ flag }: FlagToggleProps) {
  const submit = useSubmit();
  const handleChange = (value: boolean) => {
    submit({ key: flag.key, value: String(value) }, { method: 'post' });
  };
  return <Toggle value={flag.value as boolean} onChange={handleChange} />;
}
