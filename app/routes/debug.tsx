import { Button } from '~/design-system/buttons.cap.tsx';

export const loader = async () => {
  return null;
};

export const action = async () => {
  throw new Error('Sentry Error');
};

export default function Debug() {
  return (
    <div className="p-8 flex items-center gap-8">
      <Button
        type="button"
        onClick={() => {
          throw new Error('Sentry Frontend Error');
        }}
      >
        Throw client error
      </Button>
      <form method="POST">
        <Button type="submit">Throw server error</Button>
      </form>
    </div>
  );
}
