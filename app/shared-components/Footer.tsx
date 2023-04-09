import { Container } from '~/design-system/Container';

export function Footer() {
  return (
    <footer className="hidden text-left text-sm text-gray-500 sm:block">
      <Container className="py-8 text-right">&copy; 2023 Conference Hall. All rights reserved.</Container>
    </footer>
  );
}
