export function extractMainDomain(hostname: string) {
  const match = hostname.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})$/);
  return match ? match[0] : '';
}
