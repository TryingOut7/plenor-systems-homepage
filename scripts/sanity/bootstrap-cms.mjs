#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from 'next-sanity';

function parseEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  const cwd = process.cwd();
  parseEnvFile(path.join(cwd, '.env.local'));
  parseEnvFile(path.join(cwd, '.env'));
}

function hasFlag(name) {
  return process.argv.slice(2).includes(name);
}

const legacyTypeToSlug = {
  homePage: 'home',
  aboutPage: 'about',
  servicesPage: 'services',
  pricingPage: 'pricing',
  contactPage: 'contact',
};

const legacyTypeToTitle = {
  homePage: 'Home',
  aboutPage: 'About',
  servicesPage: 'Services',
  pricingPage: 'Pricing',
  contactPage: 'Contact',
};

function createPlaceholderSections(title) {
  return [
    {
      _type: 'heroSection',
      heading: title,
      subheading: 'This page was bootstrapped from legacy content. Edit from Studio.',
      theme: 'navy',
      size: 'regular',
    },
  ];
}

async function run() {
  loadEnv();

  const apply = hasFlag('--apply');
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required.');
  }
  if (!token) {
    throw new Error('SANITY_API_WRITE_TOKEN (or SANITY_API_READ_TOKEN) is required.');
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  });

  const legacyDocs = await client.fetch(
    '*[_type in ["homePage","aboutPage","servicesPage","pricingPage","contactPage"]]{_id,_type,sections}'
  );

  const sitePages = legacyDocs.map((doc) => {
    const slug = legacyTypeToSlug[doc._type] || doc._type;
    const title = legacyTypeToTitle[doc._type] || doc._type;
    return {
      _id: `sitePage.${slug}`,
      _type: 'sitePage',
      title,
      slug: { _type: 'slug', current: slug },
      pageMode: 'builder',
      templateKey: slug === 'home' ? 'landing' : 'default',
      isActive: true,
      sections: Array.isArray(doc.sections) && doc.sections.length > 0 ? doc.sections : createPlaceholderSections(title),
      seo: {
        includeInSitemap: true,
      },
    };
  });

  const siteSettingsDoc = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Plenor Systems',
    brandTagline: 'A product development framework for Testing & QA and Launch & Go-to-Market.',
    contactEmail: 'hello@plenor.ai',
    primaryCtaLabel: 'Get the Free Guide',
    primaryCtaHref: '/contact#guide',
    navigationLinks: [
      { _type: 'object', _key: 'home', label: 'Home', href: '/', isVisible: true },
      { _type: 'object', _key: 'blog', label: 'Blog', href: '/blog', isVisible: true },
      { _type: 'object', _key: 'services', label: 'Services', href: '/services', isVisible: true },
      { _type: 'object', _key: 'pricing', label: 'Pricing', href: '/pricing', isVisible: true },
      { _type: 'object', _key: 'testimonials', label: 'Testimonials', href: '/testimonials', isVisible: true },
      { _type: 'object', _key: 'about', label: 'About', href: '/about', isVisible: true },
      { _type: 'object', _key: 'contact', label: 'Contact', href: '/contact', isVisible: true },
    ],
    footerColumns: [
      {
        _type: 'object',
        _key: 'pages',
        title: 'Pages',
        links: [
          { _type: 'object', _key: 'home', label: 'Home', href: '/' },
          { _type: 'object', _key: 'blog', label: 'Blog', href: '/blog' },
          { _type: 'object', _key: 'services', label: 'Services', href: '/services' },
          { _type: 'object', _key: 'pricing', label: 'Pricing', href: '/pricing' },
          { _type: 'object', _key: 'testimonials', label: 'Testimonials', href: '/testimonials' },
          { _type: 'object', _key: 'about', label: 'About', href: '/about' },
          { _type: 'object', _key: 'contact', label: 'Contact', href: '/contact' },
        ],
      },
    ],
    socialLinks: [
      { _type: 'object', _key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/company/plenor-ai' },
    ],
    defaultSeo: {
      includeInSitemap: true,
    },
  };

  const sampleCollectionDocs = [
    {
      _id: 'blogPost.sample-cms-launch',
      _type: 'blogPost',
      title: 'Introducing the Flexible CMS Layer',
      slug: { _type: 'slug', current: 'introducing-flexible-cms-layer' },
      excerpt: 'A quick walkthrough of our new dynamic collections and page-builder architecture.',
      publishedAt: new Date().toISOString(),
      isFeatured: true,
      tags: ['cms', 'launch'],
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'This is a sample blog post created by the CMS bootstrap script.' }],
          markDefs: [],
          style: 'normal',
        },
      ],
      seo: { includeInSitemap: true },
    },
    {
      _id: 'serviceItem.sample-testing-qa',
      _type: 'serviceItem',
      title: 'Testing & QA Accelerator',
      slug: { _type: 'slug', current: 'testing-qa-accelerator' },
      summary: 'A structured QA framework for launch-ready quality gates.',
      isFeatured: true,
      tags: ['testing', 'qa'],
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'This is a sample service item created by the CMS bootstrap script.' }],
          markDefs: [],
          style: 'normal',
        },
      ],
      seo: { includeInSitemap: true },
    },
    {
      _id: 'testimonial.sample-jane-doe',
      _type: 'testimonial',
      personName: 'Jane Doe',
      slug: { _type: 'slug', current: 'jane-doe' },
      role: 'VP Product',
      company: 'Example Co',
      quote: 'The framework gave us a repeatable launch process and better release quality.',
      featured: true,
      rating: 5,
      publishedAt: new Date().toISOString(),
      seo: { includeInSitemap: true },
    },
  ];

  const docsToCreate = [siteSettingsDoc, ...sitePages, ...sampleCollectionDocs];

  console.log(`[${apply ? 'APPLY' : 'DRY RUN'}] Documents to create/update: ${docsToCreate.length}`);
  docsToCreate.forEach((doc) => console.log(`- ${doc._id} (${doc._type})`));

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to persist changes.');
    return;
  }

  for (const doc of docsToCreate) {
    await client.createOrReplace(doc);
    console.log(`✔ ${doc._id}`);
  }

  console.log('\nCMS bootstrap complete.');
}

run().catch((error) => {
  console.error(`Bootstrap failed: ${error.message}`);
  process.exitCode = 1;
});
