import { Body, Container, Head, Html, Link, Section, Tailwind } from '@react-email/components';
import { cx } from 'class-variance-authority';
import { getSharedServerEnv } from 'servers/environment.server.ts';

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
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto mt-5 mb-3 rounded-lg border border-solid border-[#eaeaea] px-5 py-2.5">
            {children}
          </Container>

          <Section className="mx-auto text-center">
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
  button: cx('box-border w-full rounded-lg bg-slate-800 px-5 py-2.5', 'text-center text-sm font-semibold text-white'),
};

BaseEmail.PreviewProps = {
  preview: 'Email preview',
  children: 'Email content',
  locale: 'en',
} as BaseEmailProps;
