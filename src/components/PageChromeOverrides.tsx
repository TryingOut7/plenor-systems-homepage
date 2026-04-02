import type { SitePage } from '@/payload/cms';
import Script from 'next/script';
import { extractSafeHeadScriptSrcs } from '@/lib/external-resource-policy';

type PageChromeOverridesProps = {
  page: Pick<SitePage, 'hideNavbar' | 'hideFooter' | 'pageBackgroundColor' | 'customHeadScripts'>;
};

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
