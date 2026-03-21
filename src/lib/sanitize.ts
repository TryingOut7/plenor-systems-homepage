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
  // Run iteratively to handle nested tags like <scr<script>ipt>
  let result = value;
  let prev: string;
  do {
    prev = result;
    result = result.replace(STRIP_TAGS_RE, '');
  } while (result !== prev);
  return result;
}

export function sanitizeTextField(value: string): string {
  return escapeHtml(stripTags(value));
}
