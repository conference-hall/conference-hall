import { createContext } from 'react-router';

export const nonceContext = createContext<{ nonce: string }>();
