/**
 * Utility to sanitize HTTP headers and prevent non-ASCII character errors
 * This ensures headers only contain ISO-8859-1 compatible characters
 */

function isAscii(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}

export function sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!headers) {
    return {};
  }

  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value !== 'string') {
      continue;
    }

    const sanitizedKey = isAscii(key) ? key : key.replace(/[^\x00-\x7F]/g, '');

    let sanitizedValue: string;
    if (isAscii(value)) {
      sanitizedValue = value;
    } else {
      sanitizedValue = value.replace(/[^\x00-\x7F]/g, '?');
    }

    if (sanitizedKey && sanitizedValue) {
      sanitized[sanitizedKey] = sanitizedValue;
    }
  }

  return sanitized;
}

const originalFetch = globalThis.fetch;

globalThis.fetch = function(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const sanitizedInit = init ? { ...init } : undefined;

  if (sanitizedInit && sanitizedInit.headers) {
    const headers = sanitizedInit.headers as Record<string, string>;
    sanitizedInit.headers = sanitizeHeaders(headers);
  }

  return originalFetch.call(this, input, sanitizedInit) as Promise<Response>;
};
