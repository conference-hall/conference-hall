import { render, screen } from '@testing-library/react';
import type { JSX } from 'react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';
import { getContrastColor } from '~/libs/colors/colors.ts';
import { Tag } from './tag.tsx';

describe('Tag component', () => {
  const tag = {
    id: '123',
    name: 'Sample Tag',
    color: '#ff0000',
  };

  const renderComponent = (Component: JSX.Element, initialEntries = ['/team/team-1/event-1']) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event/*', Component: () => Component }]);
    render(<RouteStub initialEntries={initialEntries} />);
  };

  it('renders the tag name', () => {
    renderComponent(<Tag tag={tag} />);

    expect(screen.getByText('Sample Tag')).toBeInTheDocument();
  });

  it('applies the correct background color and text color', () => {
    renderComponent(<Tag tag={tag} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveStyle({ backgroundColor: tag.color, color: getContrastColor(tag.color) });
  });

  it('creates a link with the correct href', () => {
    renderComponent(<Tag tag={tag} />, ['/team/team-1/event-1?query=foo']);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/team/team-1/event-1/reviews?query=foo&tags=123');
  });

  it('preserves existing search params in the URL', () => {
    renderComponent(<Tag tag={tag} />, ['/team/team-1/event-1?search=test']);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/team/team-1/event-1/reviews?search=test&tags=123');
  });
});
