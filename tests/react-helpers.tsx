import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

interface Props {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<Props> = ({ children }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
