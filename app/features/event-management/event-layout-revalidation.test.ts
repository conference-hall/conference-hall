import type { ShouldRevalidateFunctionArgs } from 'react-router';
import { shouldRevalidateEventLayout } from './event-layout-revalidation.ts';

const params = { team: 'team-1', event: 'event-1' };

function args(overrides: Partial<ShouldRevalidateFunctionArgs>): ShouldRevalidateFunctionArgs {
  return {
    currentUrl: new URL('http://localhost/team/team-1/event-1/proposals'),
    nextUrl: new URL('http://localhost/team/team-1/event-1/proposals'),
    currentParams: params,
    nextParams: params,
    defaultShouldRevalidate: true,
    ...overrides,
  };
}

describe('shouldRevalidateEventLayout', () => {
  it('skips navigations between proposals pages of the same event', () => {
    const result = shouldRevalidateEventLayout(
      args({
        currentUrl: new URL('http://localhost/team/team-1/event-1/proposals?status=pending'),
        nextUrl: new URL('http://localhost/team/team-1/event-1/proposals/abc?status=pending'),
        nextParams: { ...params, proposal: 'abc' },
      }),
    );

    expect(result).toBe(false);
  });

  it('revalidates when navigating outside proposals pages', () => {
    const result = shouldRevalidateEventLayout(
      args({ nextUrl: new URL('http://localhost/team/team-1/event-1/settings') }),
    );

    expect(result).toBe(true);
  });

  it('revalidates when navigating to proposals of another event', () => {
    const result = shouldRevalidateEventLayout(
      args({
        nextUrl: new URL('http://localhost/team/team-1/event-2/proposals'),
        nextParams: { ...params, event: 'event-2' },
      }),
    );

    expect(result).toBe(true);
  });

  it('skips submissions to proposals actions', () => {
    const result = shouldRevalidateEventLayout(
      args({ formMethod: 'POST', formAction: '/team/team-1/event-1/proposals/abc' }),
    );

    expect(result).toBe(false);
  });

  it('revalidates submissions to actions outside proposals pages', () => {
    const result = shouldRevalidateEventLayout(
      args({ formMethod: 'POST', formAction: '/team/team-1/event-1/settings/tags' }),
    );

    expect(result).toBe(true);
  });
});
