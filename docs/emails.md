# Email System

Conference Hall uses a job-based email system to handle transactional emails, supporting multiple providers and internationalization.

## Email Features

- **Transactional emails** for authentication and proposal workflows
- **Multi-provider support** (Mailgun for production, Mailpit for development)
- **Job queue processing** using BullMQ for reliable delivery
- **React-based templates** with Tailwind CSS styling
- **Internationalization** support for multiple locales

## Architecture

### Core Components

- **Job System**: `app/shared/emails/send-email.job.ts` - Background job processor
- **Renderer**: `app/shared/emails/email.renderer.tsx` - Template compilation
- **Providers**: `app/shared/emails/providers/` - Email delivery services
- **Templates**: `app/shared/emails/templates/` - React email components
- **Utilities**: `app/shared/emails/utils/` - Helper functions

### Email Providers

The system supports two email providers (Provider selection is environment-based):

1. **MailgunProvider** - Production email delivery via Mailgun API
2. **MailpitProvider** - Development email testing via SMTP

## React Email Integration

Conference Hall uses [React Email](https://react.email/) to build and render email templates with React components.
The email renderer compiles React components to HTML and plain text.

### React Email Components

Templates use React Email's semantic components:

```typescript
import { Button, Heading, Section, Text, Img } from '@react-email/components';

export default function ExampleEmail({ locale, ...props }: EmailProps) {
  return (
    <BaseEmail locale={locale}>
      <Heading className={styles.h1}>Title</Heading>
      <Text>Content paragraph</Text>
      <Section className={styles.card}>
        <Text><strong>Highlighted content</strong></Text>
      </Section>
      <Section className="text-center my-8">
        <Button href={actionUrl} className={styles.button}>
          Action Button
        </Button>
      </Section>
    </BaseEmail>
  );
}
```

### Styling System

Predefined styles from `base-email.tsx`:

```typescript
export const styles = {
  h1: 'text-xl',
  logo: 'mx-auto mt-[20px] mb-[32px] rounded-lg',
  card: 'bg-slate-50 border border-solid border-slate-200 rounded-[8px] px-[20px] my-[20px]',
  button:
    'box-border rounded-[8px] bg-slate-800 px-[24px] py-[12px] w-full text-center font-semibold text-sm text-white',
};
```

### Template Development

**Preview Props** - Each template includes preview data for development:

```typescript
ExampleEmail.PreviewProps = {
  locale: 'en',
  actionUrl: 'https://example.com',
  // ... other props
} as EmailProps;
```

## Sending Emails

Each template exports a convenience function for building the payload needed for the job used to send email:

```typescript
// app/shared/emails/templates/auth/email-verification.tsx
VerificationEmail.buildPayload = (email: string, locale: string, data: TemplateData): EmailPayload => {
  return {
    template: 'auth/email-verification',
    subject: 'Verify your email address for Conference Hall',
    from: 'Conference Hall <no-reply@mg.conference-hall.io>',
    to: [email],
    data,
    locale,
  };
};
```

Then the email can be sent with the `sendEmail` job:

```typescript
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import VerificationEmail from '~/shared/emails/templates/auth/email-verification.tsx';

const data = { emailVerificationUrl: 'https://...' };
await sendEmail.trigger(VerificationEmail.buildPayload(email, locale, data));
```

## Testing sent email

In integration tests, you can check an email has been sent with `sendEmail` job:

```typescript
expect(sendEmail.trigger).toHaveBeenCalledWith({
  template: 'auth/email-verification',
  subject: 'Verify your email address for Conference Hall',
  from: 'Conference Hall <no-reply@mg.conference-hall.io>',
  to: ['foo@example.com'],
  data: { emailVerificationUrl: 'https://...' },
  locale: 'en',
});
```

## Environment Configuration

### Development (Mailpit)

```env
MAILPIT_HOST=localhost
MAILPIT_SMTP_PORT=1025
```

### Production (Mailgun)

```env
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```
