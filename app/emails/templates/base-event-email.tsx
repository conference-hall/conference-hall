import { Img } from '@react-email/components';
import BaseEmail, { styles, type BaseEmailProps } from './base-email.tsx';

type BaseEventEmailProps = BaseEmailProps & {
  logoUrl: string | null;
};

export default function BaseEventEmail({ logoUrl, children, lang }: BaseEventEmailProps) {
  return (
    <BaseEmail lang={lang}>
      {logoUrl ? <Img className={styles.logo} height={100} src={logoUrl} /> : null}

      {children}
    </BaseEmail>
  );
}

BaseEventEmail.PreviewProps = {
  logoUrl: 'https://picsum.photos/seed/123/128',
  preview: 'Email preview',
  children: 'Email content',
};
