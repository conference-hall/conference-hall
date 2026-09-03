---
description: Email system
paths:
  - app/shared/emails/**
  - app/features/**/emails/**
---

# Email Conventions

## Architecture

- Emails sent via background jobs: business logic calls `sendEmail.trigger(payload)`
- Templates are React components rendered with `@react-email/components` to HTML and plain text
- Two providers: **Mailpit** (local dev via SMTP) and **Mailgun** (production via API)
- Provider auto-selected based on env vars

## Template Structure

- Templates in `app/shared/emails/templates/`, organized by audience: `auth/`, `speakers/`, `organizers/`
- Each template is React component with static `buildPayload()` method and `PreviewProps` for development
- Templates must be registered in `app/shared/emails/templates/templates.ts` — no auto-discovery
- File naming: kebab-case (`proposal-accepted.tsx`), component naming: PascalCase (`ProposalAcceptedEmail`)

## Template Pattern

```typescript
export default function MyEmail({ event, proposal, locale, customization, preview }: EmailProps) {
  const t = getEmailI18n(locale);
  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      {/* email content using t() for translations */}
    </BaseEventEmail>
  );
}

MyEmail.buildPayload = (data: TemplateData): EmailPayload => {
  const locale = data.proposal.speakers[0]?.locale || 'en';
  const t = getEmailI18n(locale);
  return {
    template: 'template-name',
    subject: t('speakers.template.subject'),
    from: t('common.email.from.event', { event: data.event.name }),
    to: [recipientEmail],
    data,
    locale,
    customEventId: data.event.id,
  };
};
```

## Base Layouts

- `BaseEmail` — for auth emails (verification, password reset). Includes Conference Hall footer
- `BaseEventEmail` — for event-related emails. Extends `BaseEmail` with optional event logo

## Translations

- Use `getEmailI18n(locale)` from `~/shared/i18n/i18n.emails.ts` for `email` namespace
- Locale defaults: recipient's stored locale → first speaker's locale → `'en'`
- Use `interpolation: { escapeValue: false }` when translations may contain HTML

## Email Customization

- Three templates customizable by organizers: `speakers-proposal-submitted`, `speakers-proposal-accepted`, `speakers-proposal-rejected`
- Customization (subject + markdown content) stored per event, per template, per locale in `EventEmailCustomization`
- Templates check `customization?.content`, render `<EmailMarkdown>` with variable interpolation (`{{proposal}}`) or fall back to default i18n
- Pass `customEventId` in payload to enable customization lookup

## Sending Emails

- **Organizer emails**: Use `sendEmail.trigger(TemplateEmail.buildPayload(data))` directly
- Bulk: `Promise.all(items.map(item => sendEmail.trigger(Template.buildPayload(item))))`
- Fire-and-forget: `void sendEmail.trigger(...)` when no need to await

## Local Development

- Mailpit runs via Docker Compose, UI for inspecting sent emails
- Templates have `PreviewProps` for React Email preview during development
