import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useSearchParams } from 'react-router';
import { Input } from '~/design-system/forms/input.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';

export function MemberFilters() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const roleOptions = [
    { value: '', name: t('team.settings.members.list.all-roles') },
    { value: 'OWNER', name: t('common.member.role.label.OWNER') },
    { value: 'MEMBER', name: t('common.member.role.label.MEMBER') },
    { value: 'REVIEWER', name: t('common.member.role.label.REVIEWER') },
  ];

  return (
    <Form
      ref={formRef}
      method="GET"
      className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <Input
        type="search"
        name="query"
        aria-label={t('team.settings.members.search')}
        placeholder={t('team.settings.members.search')}
        defaultValue={searchParams.get('query') || ''}
        icon={MagnifyingGlassIcon}
        className="grow"
      />

      <SelectNative
        name="role"
        label={t('team.settings.members.list.role-filter')}
        defaultValue={searchParams.get('role') || ''}
        onChange={() => {
          formRef.current?.submit();
        }}
        options={roleOptions}
        srOnly
      />
    </Form>
  );
}
