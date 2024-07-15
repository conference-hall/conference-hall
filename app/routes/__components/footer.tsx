import { Link } from '@remix-run/react';

import { Container } from '~/design-system/layouts/container.tsx';

export function Footer() {
  return (
    <footer className="hidden py-8 text-sm text-gray-500 sm:block">
      <Container className="flex gap-4 justify-center items-center">
        <span>&copy; 2024 Conference Hall.</span>
        <LegalLinks />
      </Container>
    </footer>
  );
}

export function LegalLinks() {
  return (
    <div className="flex gap-4 justify-center items-center text-sm text-gray-500">
      <Link to="/docs/terms" target="_blank" className="hover:underline underline-offset-2">
        Terms
      </Link>
      <Link to="/docs/privacy" target="_blank" className="hover:underline underline-offset-2">
        Privacy
      </Link>
      <Link to="/docs/license" target="_blank" className="hover:underline underline-offset-2">
        License
      </Link>
    </div>
  );
}
