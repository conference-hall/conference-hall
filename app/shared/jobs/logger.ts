import { getSharedServerEnv } from 'servers/environment.server.ts';

const env = getSharedServerEnv();

const isProduction = env.NODE_ENV === 'production';

export const logger = {
  info: (message: string, rest?: Record<string, any>) => log('info', message, rest),
  error: (message: string, rest?: Record<string, any>) => log('error', message, rest),
};

function log(level: 'info' | 'error', message: string, rest?: Record<string, any>) {
  if (isProduction) {
    console[level](JSON.stringify({ message, ...rest }));
  } else {
    rest ? console[level](message, rest) : console[level](message);
  }
}
