import { Body, Container, Head, Html, Link, Section, Tailwind } from '@react-email/components';
import { cx } from 'class-variance-authority';
import { getSharedServerEnv } from '../../../../../shared/src/environment/environment.ts';

const { APP_URL } = getSharedServerEnv();

export type BaseEmailProps = {
  children: React.ReactNode;
  locale: string;
};

export default function BaseEmail({ children, locale }: BaseEmailProps) {
  return (
    <Html lang={locale}>
      <Head />

      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded-lg mt-5 mb-3 mx-auto px-5 py-2.5">
            {children}
          </Container>

          <Section className="text-center mx-auto">
            <Link href={APP_URL} className="text-xs text-gray-400">
              Powered by Conference Hall
            </Link>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}

export const styles = {
  h1: 'text-xl',
  logo: 'mx-auto mt-5 mb-3 rounded-lg',
  card: 'bg-slate-50 border border-solid border-slate-200 rounded-lg px-5 my-5',
  button: cx('box-border rounded-lg bg-slate-800 px-5 py-2.5 w-full', 'text-center font-semibold text-sm text-white'),
};

BaseEmail.PreviewProps = {
  preview: 'Email preview',
  children: 'Email content',
  locale: 'en',
} as BaseEmailProps;
