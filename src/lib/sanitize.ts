import sanitizeHtml from 'sanitize-html';

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'video', 'source', 'iframe']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'loading'],
    video: ['src', 'controls', 'width', 'height'],
    source: ['src', 'type'],
    iframe: ['src', 'width', 'height', 'title', 'allowfullscreen'],
    a: ['href', 'target', 'rel'],
  },
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'www.loom.com'],
};

export function sanitize(dirty: string): string {
  return sanitizeHtml(dirty, defaultOptions);
}

export function escapeForJsonLd(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
