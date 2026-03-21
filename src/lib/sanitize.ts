const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const ESCAPE_RE = /[&<>"']/g;

export function escapeHtml(value: string): string {
  return value.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch] || ch);
}

const STRIP_TAGS_RE = /<[^>]*>/g;

export function stripTags(value: string): string {
  return value.replace(STRIP_TAGS_RE, '');
}

export function sanitizeTextField(value: string): string {
  return escapeHtml(stripTags(value));
}
