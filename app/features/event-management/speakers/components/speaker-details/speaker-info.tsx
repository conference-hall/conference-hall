import { useTranslation } from 'react-i18next';
import { Markdown } from '~/design-system/markdown.tsx';

type Props = {
  bio?: string | null;
  references?: string | null;
  className?: string;
};

export function SpeakerInfo({ bio, references, className }: Props) {
  const { t } = useTranslation();

  const details = [
    { key: 'bio', label: t('speaker.profile.biography'), value: bio },
    { key: 'references', label: t('speaker.profile.references'), value: references },
  ].filter((detail) => Boolean(detail.value));

  return details.map((detail) => (
    <div key={detail.label} className={className}>
      <div className="font-medium text-gray-900 text-sm leading-6">{detail.label}</div>
      <div className="wrap-break-word mt-1 text-gray-700 text-sm leading-6">
        {(detail.key === 'bio' || detail.key === 'references') && detail.value ? (
          <Markdown>{detail.value as string}</Markdown>
        ) : (
          detail.value
        )}
      </div>
    </div>
  ));
}
