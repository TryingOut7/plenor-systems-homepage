'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import SectionHeading from './shared/SectionHeading';
import type { HeadingTag, SectionRendererProps, SectionTheme } from './types';
import { asSectionRecord, isDarkTheme } from './utils';

interface TabsSectionRendererProps {
  sectionKey: string;
  section: Record<string, unknown>;
  tabs: unknown[];
  sectionStyle: CSSProperties;
  innerStyle: CSSProperties;
  theme: SectionTheme;
  headingColor: string;
  mutedColor: string;
  bodyColor: string;
  hTag?: HeadingTag;
  hFontSize?: string;
}

function TabsSectionRenderer({
  sectionKey,
  section,
  tabs,
  sectionStyle,
  innerStyle,
  theme,
  headingColor,
  mutedColor,
  bodyColor,
  hTag = 'h2',
  hFontSize,
}: TabsSectionRendererProps) {
  const [activeTab, setActiveTab] = useState(0);
  const dark = isDarkTheme(theme);

  const tabItems = tabs.map((tabValue: unknown) => {
    const tab =
      tabValue && typeof tabValue === 'object'
        ? (tabValue as Record<string, unknown>)
        : {};
    const imgObj =
      tab.image && typeof tab.image === 'object'
        ? (tab.image as Record<string, unknown>)
        : null;
    const imageUrl = imgObj ? (typeof imgObj.url === 'string' ? imgObj.url : '') : '';

    return {
      label: typeof tab.label === 'string' ? tab.label : '',
      heading: typeof tab.heading === 'string' ? tab.heading : '',
      body: typeof tab.body === 'string' ? tab.body : '',
      imageUrl,
      linkLabel: typeof tab.linkLabel === 'string' ? tab.linkLabel : '',
      linkHref: typeof tab.linkHref === 'string' ? tab.linkHref : '',
    };
  });

  const safeActive = Math.min(activeTab, Math.max(tabItems.length - 1, 0));
  const current = tabItems[safeActive];

  return (
    <section
      id={typeof section.anchorId === 'string' ? section.anchorId : undefined}
      style={sectionStyle}
      className={typeof section.customClassName === 'string' ? section.customClassName : undefined}
    >
      <div style={innerStyle}>
        {section.heading ? (
          <SectionHeading
            tag={hTag}
            style={{
              textAlign: 'center',
              marginBottom: section.subheading ? '8px' : '32px',
              color: headingColor,
              fontSize: hFontSize,
            }}
          >
            {String(section.heading)}
          </SectionHeading>
        ) : null}
        {section.subheading ? (
          <p style={{ textAlign: 'center', marginBottom: '32px', color: mutedColor }}>
            {String(section.subheading)}
          </p>
        ) : null}

        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: '4px',
            borderBottom: `2px solid ${dark ? 'rgba(255,255,255,0.15)' : 'var(--ui-color-border)'}`,
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          {tabItems.map((tab, idx) => (
            <button
              key={`${sectionKey}-tab-${idx}`}
              role="tab"
              aria-selected={idx === safeActive}
              aria-controls={`${sectionKey}-tabpanel-${idx}`}
              type="button"
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 0,
                borderBottom:
                  idx === safeActive
                    ? '2px solid var(--ui-color-primary)'
                    : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                fontWeight: idx === safeActive ? 600 : 400,
                color:
                  idx === safeActive
                    ? dark
                      ? 'var(--ui-color-dark-text)'
                      : 'var(--ui-color-primary)'
                    : mutedColor,
                fontFamily: 'var(--ui-font-body)',
                fontSize: '15px',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {current ? (
          <div
            id={`${sectionKey}-tabpanel-${safeActive}`}
            role="tabpanel"
            style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: '240px' }}>
              {current.heading ? (
                <h3 style={{ marginBottom: '16px', color: headingColor }}>
                  {current.heading}
                </h3>
              ) : null}
              {current.body ? (
                <p style={{ lineHeight: 1.7, color: bodyColor }}>{current.body}</p>
              ) : null}
              {current.linkHref && current.linkLabel ? (
                <a
                  href={current.linkHref}
                  style={{
                    display: 'inline-block',
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: 'var(--ui-button-primary-bg)',
                    color: 'var(--ui-button-primary-text)',
                    borderRadius: 'var(--ui-button-radius)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {current.linkLabel}
                </a>
              ) : null}
            </div>
            {current.imageUrl ? (
              <div style={{ flex: 1, minWidth: '240px' }}>
                <Image
                  src={current.imageUrl}
                  alt={current.heading || ''}
                  width={0}
                  height={0}
                  sizes="600px"
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function TabsSection({
  section,
  sectionKey,
  sectionStyle,
  theme,
  hTag,
  hFontSize,
  innerStyle,
  resolvedHeadingColor,
  resolvedBodyColor,
  resolvedMutedColor,
}: SectionRendererProps) {
  const sectionRecord = asSectionRecord(section);
  const tabs = Array.isArray(sectionRecord.tabs) ? sectionRecord.tabs : [];

  return (
    <TabsSectionRenderer
      sectionKey={sectionKey}
      section={sectionRecord}
      tabs={tabs}
      sectionStyle={sectionStyle}
      innerStyle={innerStyle}
      theme={theme}
      headingColor={resolvedHeadingColor}
      mutedColor={resolvedMutedColor}
      bodyColor={resolvedBodyColor}
      hTag={hTag}
      hFontSize={hFontSize}
    />
  );
}
