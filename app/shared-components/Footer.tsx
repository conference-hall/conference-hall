import { Container } from '~/design-system/Container';

export function Footer() {
  return (
    <footer className="py-8 text-sm text-gray-500">
      <Container className="hidden text-right sm:block">&copy; 2023 Conference Hall. All rights reserved.</Container>
    </footer>
  );
}
