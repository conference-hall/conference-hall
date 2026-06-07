import { useTranslation } from 'react-i18next';
import { Text } from '~/design-system/typography.tsx';

export function LastSignInUsed() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center">
      <Text
        size="xs"
        variant="secondary"
        className="w-fit rounded-b-md bg-gray-50 px-2 py-0.5 shadow-xs ring-1 ring-gray-300"
      >
        {t('auth.signin.last-used')}
      </Text>
    </div>
  );
}
