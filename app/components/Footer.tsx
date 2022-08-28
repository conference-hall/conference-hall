import { Container } from '~/design-system/Container';

export function Footer() {
  return (
    <footer className="mt-16 hidden text-left text-sm text-gray-500 sm:block">
      <Container className="border-t border-gray-300 py-8">&copy; 2021 Conference Hall. All rights reserved.</Container>
    </footer>
  );
}
