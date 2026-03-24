import type { SitePage } from '@/payload/cms';

type PageChromeOverridesProps = {
  page: Pick<SitePage, 'hideNavbar' | 'hideFooter' | 'pageBackgroundColor' | 'customHeadScripts'>;
};

const ALLOWED_SCRIPT_RE = /^<script\b[^>]*src=["'][^"']+["'][^>]*>\s*<\/script>$/i;

function sanitizeHeadScripts(raw: string): string {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && ALLOWED_SCRIPT_RE.test(line))
    .join('\n');
}

export default function PageChromeOverrides({ page }: PageChromeOverridesProps) {
  const cssRules = [
    page.hideNavbar ? 'header[role="banner"] { display: none !important; }' : '',
    page.hideFooter ? 'footer[role="contentinfo"] { display: none !important; }' : '',
    page.pageBackgroundColor
      ? `body { background-color: ${page.pageBackgroundColor} !important; }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const safeScripts = page.customHeadScripts
    ? sanitizeHeadScripts(page.customHeadScripts)
    : '';

  return (
    <>
      {cssRules ? <style>{cssRules}</style> : null}
      {safeScripts ? (
        <div dangerouslySetInnerHTML={{ __html: safeScripts }} style={{ display: 'none' }} />
      ) : null}
    </>
  );
}
