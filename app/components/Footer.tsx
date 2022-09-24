import { Container } from '~/design-system/Container';

export function Footer() {
  return (
    <footer className="mt-16 hidden text-left text-sm text-gray-500 sm:block">
      <Container className="py-8 text-center">&copy; 2021 Conference Hall. All rights reserved.</Container>
    </footer>
  );
}
