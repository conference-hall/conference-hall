import { Body, Container, Head, Html, Link, Section, Tailwind } from '@react-email/components';
import { cx } from 'class-variance-authority';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const env = getSharedServerEnv();

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
          <Container className="border border-solid border-[#eaeaea] rounded-[8px] mt-[20px] mb-[12px] mx-auto px-[20px] py-[10px]">
            {children}
          </Container>

          <Section className="text-center mx-auto">
            <Link href={env.APP_URL} className="text-xs text-gray-400">
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
  logo: 'mx-auto mt-[20px] mb-[32px] rounded-lg',
  card: 'bg-slate-50 border border-solid border-slate-200 rounded-[8px] px-[20px] my-[20px]',
  button: cx(
    'box-border rounded-[8px] bg-slate-800 px-[24px] py-[12px] w-full',
    'text-center font-semibold text-sm text-white',
  ),
};

BaseEmail.PreviewProps = {
  preview: 'Email preview',
  children: 'Email content',
  locale: 'en',
} as BaseEmailProps;
