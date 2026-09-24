import {
  context,
  propagation,
  type Span,
  SpanKind,
  SpanStatusCode,
  type TextMapGetter,
  trace,
} from '@opentelemetry/api';
import type { ServerInstrumentation } from 'react-router';

const TRACER_NAME = 'app/react-router';

const IGNORED_PATH_PREFIXES = ['/assets/', '/favicons/', '/fonts/'];
const IGNORED_PATHS = ['/robots.txt', '/favicon.ico', '/site.webmanifest', '/healthcheck', '/__manifest'];

type ReadonlyHeaders = { get(name: string): string | null };

const headersGetter: TextMapGetter<ReadonlyHeaders> = {
  keys: () => ['traceparent', 'tracestate'],
  get: (headers, key) => headers.get(key) ?? undefined,
};

function pathnameOf(url: string) {
  return new URL(url).pathname;
}

function isIgnoredPath(url: string) {
  const pathname = pathnameOf(url);
  return IGNORED_PATHS.includes(pathname) || IGNORED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function endSpan(span: Span, error: Error | undefined) {
  if (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.recordException(error);
  }
  span.end();
}

function traceRouteHandler(spanName: string) {
  return async (callHandler: () => Promise<{ error?: Error }>, info: { request: { url: string } }) => {
    if (isIgnoredPath(info.request.url)) {
      await callHandler();
      return;
    }

    await trace.getTracer(TRACER_NAME).startActiveSpan(spanName, async (span) => {
      let error: Error | undefined;
      try {
        error = (await callHandler()).error;
      } finally {
        endSpan(span, error);
      }
    });
  };
}

const instrumentation: ServerInstrumentation = {
  handler(handler) {
    handler.instrument({
      request: async (callHandler, info) => {
        if (isIgnoredPath(info.request.url)) {
          await callHandler();
          return;
        }

        const { method, url, headers } = info.request;
        const parentContext = propagation.extract(context.active(), headers, headersGetter);
        const spanOptions = {
          kind: SpanKind.SERVER,
          attributes: { 'http.request.method': method, 'url.path': pathnameOf(url) },
        };

        await trace
          .getTracer(TRACER_NAME)
          .startActiveSpan(`${method} [react-router]`, spanOptions, parentContext, async (span) => {
            let error: Error | undefined;
            try {
              const result = await callHandler();
              error = result.error;

              span.setAttribute('http.response.status_code', result.statusCode);
              const pattern = result.meta?.pattern;
              if (pattern) {
                span.setAttribute('http.route', pattern);
                span.updateName(`${method} ${pattern}`);
              }

              if (result.statusCode >= 500) {
                span.setStatus({ code: SpanStatusCode.ERROR });
              }
            } finally {
              endSpan(span, error);
            }
          });
      },
    });
  },

  route(route) {
    const name = route.path || route.id;
    route.instrument({
      middleware: traceRouteHandler(`middleware ${name}`),
      loader: traceRouteHandler(`loader ${name}`),
      action: traceRouteHandler(`action ${name}`),
    });
  },
};

export const instrumentations = process.env.OTEL_ENABLED === 'true' ? [instrumentation] : undefined;
