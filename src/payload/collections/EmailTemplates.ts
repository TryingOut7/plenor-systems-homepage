import type { CollectionConfig } from 'payload';
import { validatePathOrHttpUrl } from '../validation/url.ts';

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subject', 'updatedAt'],
    group: 'Settings',
    description: 'Reusable email messages for guides, whitepapers, and other downloadable resources. Link a template to your guide form workflow so each "Send me the guide" flow delivers the right content.',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    update: ({ req }) => !!req.user && ['admin', 'editor'].includes((req.user as Record<string, unknown>).role as string),
    delete: ({ req }) => !!req.user && (req.user as Record<string, unknown>).role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal label — shown in dropdowns when linking this template to a form section.',
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'The email subject line the recipient sees in their inbox.',
      },
    },
    {
      name: 'preheader',
      type: 'text',
      admin: {
        description: 'Short preview text shown after the subject line in most email clients (60–90 chars).',
      },
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'Main heading inside the email, e.g. "Here\'s your guide, {name}."',
      },
    },
    {
      name: 'highlightTitle',
      type: 'text',
      admin: {
        description: 'Bold document title shown in the email body — e.g. the guide or whitepaper name.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      admin: {
        description: 'Body copy beneath the title. Describe what the document covers or why it\'s valuable.',
        rows: 5,
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      admin: {
        description: 'Label for the download / action button inside the email, e.g. "Download the guide".',
      },
    },
    {
      name: 'buttonUrl',
      type: 'text',
      validate: validatePathOrHttpUrl,
      admin: {
        description: 'URL the button links to — typically a direct link to the PDF or landing page.',
      },
    },
    {
      name: 'replyTo',
      type: 'email',
      admin: {
        position: 'sidebar',
        description: 'Override the reply-to address for this specific template. Leave blank to use the default.',
      },
    },
  ],
};
