import { Container } from '~/design-system/layouts/container.tsx';

export function Footer() {
  return (
    <footer className="hidden py-8 text-sm text-gray-500 sm:block">
      <Container className="text-right">&copy; 2024 Conference Hall. All rights reserved.</Container>
    </footer>
  );
}
