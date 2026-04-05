const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const ESCAPE_RE = /[&<>"']/g;
const STRIP_TAGS_RE = /<[^>]*>/g;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function sanitizeText(value: string): string {
  let stripped = value;
  let previous: string;

  do {
    previous = stripped;
    stripped = stripped.replace(STRIP_TAGS_RE, '');
  } while (previous !== stripped);

  return stripped.replace(ESCAPE_RE, (char) => ESCAPE_MAP[char] || char);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}
