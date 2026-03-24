import type { SitePage } from '@/payload/cms';

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

  return (
    <>
      {cssRules ? <style>{cssRules}</style> : null}
      {page.customHeadScripts ? (
        <div dangerouslySetInnerHTML={{ __html: page.customHeadScripts }} style={{ display: 'none' }} />
      ) : null}
    </>
  );
}
