import { useTranslation } from 'react-i18next';
import { href, Link } from 'react-router';
import { Container } from '~/design-system/layouts/container.tsx';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="hidden py-8 text-sm text-gray-500 lg:block">
      <Container className="flex items-center justify-center gap-4">
        <span>{t('footer.copyright', { year })}</span>
        <LegalLinks />
      </Container>
    </footer>
  );
}

export function LegalLinks() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
      <Link to={href('/docs/terms')} target="_blank" className="underline-offset-2 hover:underline">
        {t('footer.terms')}
      </Link>
      <Link to={href('/docs/privacy')} target="_blank" className="underline-offset-2 hover:underline">
        {t('footer.privacy')}
      </Link>
      <Link to={href('/docs/license')} target="_blank" className="underline-offset-2 hover:underline">
        {t('footer.license')}
      </Link>
      <a
        href="https://github.com/conference-hall/conference-hall"
        target="_blank"
        className="underline-offset-2 hover:underline"
        rel="noreferrer"
      >
        {t('footer.source')}
      </a>
      <a
        href="https://github.com/sponsors/conference-hall"
        target="_blank"
        className="underline-offset-2 hover:underline"
        rel="noreferrer"
      >
        {t('footer.sponsor')}
      </a>
    </div>
  );
}
