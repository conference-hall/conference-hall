export function buildLoaderRoute(path: string, params?: { [key: string]: string }) {
  const url = new URL(path, 'http://localhost:3000');
  return {
    request: new Request(url.toString()),
    context: {},
    params: params || {},
  };
}
