import { useTranslation } from 'react-i18next';
import { Link, href } from 'react-router';

import { Container } from '~/design-system/layouts/container.tsx';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="py-8 text-sm text-gray-500">
      <Container className="flex gap-4 justify-center items-center">
        <span className="hidden sm:inline">{t('footer.copyright', { year })}</span>
        <LegalLinks />
      </Container>
    </footer>
  );
}

export function LegalLinks() {
  const { t } = useTranslation();
  return (
    <div className="flex gap-4 justify-center items-center text-sm text-gray-500">
      <Link to={href('/docs/terms')} target="_blank" className="hover:underline underline-offset-2">
        {t('footer.terms')}
      </Link>
      <Link to={href('/docs/privacy')} target="_blank" className="hover:underline underline-offset-2">
        {t('footer.privacy')}
      </Link>
      <Link to={href('/docs/license')} target="_blank" className="hover:underline underline-offset-2">
        {t('footer.license')}
      </Link>
      <a
        href="https://github.com/conference-hall/conference-hall"
        target="_blank"
        className="hover:underline underline-offset-2"
        rel="noreferrer"
      >
        {t('footer.source')}
      </a>
      <a
        href="https://github.com/sponsors/conference-hall"
        target="_blank"
        className="hover:underline underline-offset-2"
        rel="noreferrer"
      >
        {t('footer.sponsor')}
      </a>
    </div>
  );
}
