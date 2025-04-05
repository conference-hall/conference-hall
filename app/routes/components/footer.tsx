import { Link, href } from 'react-router';

import { Container } from '~/design-system/layouts/container.tsx';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-8 text-sm text-gray-500">
      <Container className="flex gap-4 justify-center items-center">
        <span className="hidden sm:inline">&copy; {year} Conference Hall.</span>
        <LegalLinks />
      </Container>
    </footer>
  );
}

export function LegalLinks() {
  return (
    <div className="flex gap-4 justify-center items-center text-sm text-gray-500">
      <Link to={href('/docs/terms')} target="_blank" className="hover:underline underline-offset-2">
        Terms
      </Link>
      <Link to={href('/docs/privacy')} target="_blank" className="hover:underline underline-offset-2">
        Privacy
      </Link>
      <Link to={href('/docs/license')} target="_blank" className="hover:underline underline-offset-2">
        License
      </Link>
      <a
        href="https://github.com/conference-hall/conference-hall"
        target="_blank"
        className="hover:underline underline-offset-2"
        rel="noreferrer"
      >
        GitHub
      </a>
      <a
        href="https://github.com/sponsors/conference-hall"
        target="_blank"
        className="hover:underline underline-offset-2"
        rel="noreferrer"
      >
        Sponsor
      </a>
    </div>
  );
}
