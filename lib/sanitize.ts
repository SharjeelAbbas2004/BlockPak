/**
 * HTML sanitization for user/editor-provided article content.
 *
 * Every write path that stores rendered HTML (admin article create/update)
 * MUST run content through `sanitizeHtml` before persisting, so a stored-XSS
 * payload can never reach readers.
 */
import sanitizeHtmlLib from 'sanitize-html';

/** Strip everything outside the editorial allowlist. */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: [
      'p',
      'h2',
      'h3',
      'strong',
      'em',
      'a',
      'img',
      'blockquote',
      'ul',
      'ol',
      'li',
      'table',
      'tr',
      'td',
      'th',
      'pre',
      'code',
      'div',
      'span',
      'br',
      'hr',
    ],
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt'],
      div: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Drop <script>/<style> bodies entirely rather than escaping them.
    nonTextTags: ['script', 'style', 'textarea', 'noscript'],
  });
}

/**
 * Sanitize a user-submitted comment. Comments are stored and rendered as
 * plain text (React escapes them), so this is a simple, dependency-free
 * replace: strip <script>…</script> blocks and inline event-handler
 * attributes, then trim.
 */
export function sanitizeComment(dirty: string): string {
  return dirty
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<\/?script\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .trim();
}
