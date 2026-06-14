import type { JSX } from 'react';
import { page } from 'vitest/browser';
import { Join } from './join.tsx';

describe('Join component', () => {
  const render = (component: JSX.Element) => page.render(component);

  it('renders a string separator between each child', async () => {
    const screen = await render(
      <Join by=" · ">
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Join>,
    );

    expect(screen.container.textContent).toBe('a · b · c');
  });

  it('renders an element separator between each child', async () => {
    const screen = await render(
      <Join by={<span data-testid="sep">/</span>}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Join>,
    );

    expect(screen.getByTestId('sep').elements()).toHaveLength(2);
    expect(screen.container.textContent).toBe('a/b/c');
  });

  it('skips falsy children without leaving orphan separators', async () => {
    const screen = await render(
      <Join by=" · ">
        {false}
        <span>a</span>
        {null}
        <span>b</span>
        {undefined}
      </Join>,
    );

    expect(screen.container.textContent).toBe('a · b');
  });

  it('renders a single child without a separator', async () => {
    const screen = await render(
      <Join by=" · ">
        <span>a</span>
      </Join>,
    );

    expect(screen.container.textContent).toBe('a');
  });

  it('renders nothing when there are no effective children', async () => {
    const screen = await render(<Join by=" · ">{null}</Join>);

    expect(screen.container.textContent).toBe('');
  });
});
