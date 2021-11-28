import { Form } from 'remix';
import { Container } from '../components/Container';
import { SearchEventForm } from '../components/SearchEventForm';

export default function IndexRoute() {
  return (
    <Container>
      <SearchEventForm />
      <Form action="/logout" method="post">
        <button type="submit">Logout</button>
      </Form>
    </Container>
  );
}
