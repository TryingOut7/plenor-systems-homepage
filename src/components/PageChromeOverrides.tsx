import type { SitePage } from '@/payload/cms';
import Script from 'next/script';
import { extractSafeHeadScriptSrcs } from '@/lib/external-resource-policy';
import { normalizeSafeCssColorValue } from '@/lib/safeCss';

type PageChromeOverridesProps = {
  page: Pick<SitePage, 'hideNavbar' | 'hideFooter' | 'pageBackgroundColor' | 'customHeadScripts'>;
};

export function buildPageChromeOverrideCss(
  page: PageChromeOverridesProps['page'],
): string {
  const backgroundColor = normalizeSafeCssColorValue(page.pageBackgroundColor);

  return [
    page.hideNavbar ? 'header[role="banner"] { display: none !important; }' : '',
    page.hideFooter ? 'footer[role="contentinfo"] { display: none !important; }' : '',
    backgroundColor ? `body { background-color: ${backgroundColor} !important; }` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export default function PageChromeOverrides({ page }: PageChromeOverridesProps) {
  const cssRules = buildPageChromeOverrideCss(page);
  const safeScriptSrcs = extractSafeHeadScriptSrcs(page.customHeadScripts);

  return (
    <>
      {cssRules ? <style>{cssRules}</style> : null}
      {safeScriptSrcs.map((src, index) => (
        <Script key={`${src}-${index}`} src={src} strategy="afterInteractive" />
      ))}
    </>
  );
}
