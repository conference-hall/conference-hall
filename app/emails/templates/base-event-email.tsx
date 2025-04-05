import { Img } from '@react-email/components';
import BaseEmail, { styles, type BaseEmailProps } from './base-email.tsx';

type BaseEventEmailProps = BaseEmailProps & { logoUrl?: string | null };

export default function BaseEventEmail({ logoUrl, children, locale }: BaseEventEmailProps) {
  return (
    <BaseEmail locale={locale}>
      {logoUrl?.startsWith('https://') ? (
        <Img className={styles.logo} height={70} width={70} src={logoUrl} alt="" />
      ) : null}

      {children}
    </BaseEmail>
  );
}

BaseEventEmail.PreviewProps = {
  logoUrl: 'https://picsum.photos/seed/123/128',
  preview: 'Email preview',
  children: 'Email content',
  locale: 'en',
} as BaseEventEmailProps;
