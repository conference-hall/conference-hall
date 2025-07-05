import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Badge } from '~/shared/design-system/badges.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { NavTab, NavTabs } from '~/shared/design-system/navigation/nav-tabs.tsx';
import type { TeamRole } from '~/types/team.types.ts';

type Props = { slug: string; role: TeamRole };

export function TeamTabs({ slug, role }: Props) {
  const { t } = useTranslation();
  return (
    <Page.NavHeader className="flex items-center justify-between">
      <NavTabs py={4} scrollable>
        <NavTab to={href('/team/:team', { team: slug })} icon={StarIcon} end>
          {t('common.events')}
        </NavTab>
        <NavTab to={href('/team/:team/settings', { team: slug })} icon={Cog6ToothIcon}>
          {t('common.settings')}
        </NavTab>
      </NavTabs>
      <Badge color="blue">{t(`common.member.role.label.${role}`)}</Badge>
    </Page.NavHeader>
  );
}
