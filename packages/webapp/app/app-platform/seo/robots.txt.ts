import { flags } from '~/shared/feature-flags/flags.server.ts';
import { getSharedServerEnv } from '../../../../shared/src/environment/environment.ts';

const { APP_URL } = getSharedServerEnv();

const ROBOT_TXT_PRODUCTION = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /invite/
Disallow: /speaker/
Disallow: /team/
Disallow: /debug/
Disallow: /notifications/
Disallow: /storage/
Disallow: /admin/
Disallow: /cdn-cgi/

Sitemap: ${APP_URL}/sitemap.xml
`;

const ROBOT_TXT_DEV = `User-agent: *
Disallow: /
Noindex: /

Sitemap: ${APP_URL}/sitemap.xml
`;

export const loader = async () => {
  const isSeoEnabled = await flags.get('seo');
  const robotText = isSeoEnabled ? ROBOT_TXT_PRODUCTION : ROBOT_TXT_DEV;
  const bytes = new TextEncoder().encode(robotText).byteLength;

  return new Response(robotText, {
    headers: { 'Content-Type': 'text/plain', 'Content-Length': String(bytes) },
  });
};
