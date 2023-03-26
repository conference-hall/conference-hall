import { StatIndicator } from '~/design-system/charts/StatIndicator';

type Props = { stats: { toSend: number; sent: number; delivered: number } };

export function CampaignEmailStats({ stats }: Props) {
  return (
    <dl className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatIndicator label="Email to send">{stats.toSend}</StatIndicator>
      <StatIndicator label="Emails sent">{stats.sent}</StatIndicator>
      <StatIndicator label="Emails delivered">{stats.delivered}</StatIndicator>
    </dl>
  );
}
