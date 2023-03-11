import React from 'react';

import type { GlobalProvider } from '@ladle/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import '../app/tailwind.css';

export const Provider: GlobalProvider = ({ children }) => (
  <RouterProvider
    router={createMemoryRouter([
      {
        path: '/',
        element: children,
      },
    ])}
  />
);
