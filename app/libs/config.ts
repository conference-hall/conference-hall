const ENV = process.env.NODE_ENV || 'development';
const USE_EMULATORS = Boolean(process.env.USE_EMULATORS) || false;

export let config: Config;

class Config {
  ENV: string;
  USE_EMULATORS: boolean;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_AUTH_EMULATOR_HOST: string;
  FIREBASE_STORAGE: string;
  GOOGLE_PLACES_API_KEY: string;
  COOKIE_SIGNED_SECRET: string;
  MAILGUN_DOMAIN: string;
  MAILGUN_API_KEY: string;
  MAILHOG_HOST: string;
  MAILHOG_SMTP_PORT: number;
  MAILHOG_HTTP_PORT: number;

  constructor() {
    this.ENV = ENV;
    this.USE_EMULATORS = USE_EMULATORS;
    this.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
    this.FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';
    this.FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || '';
    this.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '';
    this.FIREBASE_STORAGE = process.env.FIREBASE_STORAGE || '';
    this.GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
    this.COOKIE_SIGNED_SECRET = process.env.COOKIE_SIGNED_SECRET || 'secr3t';
    this.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
    this.MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '';
    this.MAILHOG_HOST = 'localhost';
    this.MAILHOG_SMTP_PORT = 1025;
    this.MAILHOG_HTTP_PORT = 8025;
  }

  get appUrl(): string {
    const { PROTOCOL, DOMAIN, PORT } = process.env;
    if (!PORT) return `${PROTOCOL}://${DOMAIN}`;
    return `${PROTOCOL}://${DOMAIN}:${PORT}`;
  }

  get isProduction(): boolean {
    return this.ENV === 'production';
  }

  get isDevelopment(): boolean {
    return this.ENV === 'development';
  }

  get useEmulators(): boolean {
    return this.USE_EMULATORS;
  }

  get isMailgunEnabled(): boolean {
    return !!this.MAILGUN_API_KEY && !!this.MAILGUN_DOMAIN;
  }
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// reload the env config with every change either.
declare global {
  // eslint-disable-next-line no-var
  var __config: Config | undefined;
}

if (ENV === 'production') {
  config = new Config();
} else {
  if (!global.__config) {
    console.info(`🌍 Environment "${ENV}".`);
    global.__config = new Config();
  }
  config = global.__config;
}
