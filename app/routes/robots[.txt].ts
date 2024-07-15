import type { LoaderFunctionArgs } from '@remix-run/node';

import { appUrl } from '~/libs/env/env.server.ts';

const isSeoEnabled = process.env.SEO_ENABLED === 'true';

const ROBOT_TXT_PRODUCTION = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /invite/
Disallow: /speaker/
Disallow: /team/
Disallow: /debug/
Disallow: /notifications/

Sitemap: ${appUrl()}/sitemap.xml
`;

const ROBOT_TXT_DEV = `User-agent: *
Disallow: /
Noindex: /

Sitemap: ${appUrl()}/sitemap.xml
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const robotText = isSeoEnabled ? ROBOT_TXT_PRODUCTION : ROBOT_TXT_DEV;
  const bytes = new TextEncoder().encode(robotText).byteLength;

  return new Response(robotText, {
    headers: { 'Content-Type': 'text/plain', 'Content-Length': String(bytes) },
  });
};
