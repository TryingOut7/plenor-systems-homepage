# Sanity Schema Cookbook

Copy-paste snippets for all core Sanity Studio schema types.

Official reference:
- https://www.sanity.io/docs/studio/schema-types

## Base Imports

```ts
import {defineType, defineField, defineArrayMember} from 'sanity'
```

## Document Type (`document`)

```ts
export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}}),
  ],
  preview: {
    select: {title: 'title'},
  },
})
```

## Object Type (`object`)

```ts
export const cta = defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string'}),
    defineField({name: 'href', type: 'url'}),
  ],
})
```

## String (`string`)

```ts
defineField({
  name: 'status',
  title: 'Status',
  type: 'string',
  options: {
    list: [
      {title: 'Draft', value: 'draft'},
      {title: 'Published', value: 'published'},
    ],
    layout: 'radio',
  },
  validation: (Rule) => Rule.required(),
})
```

## Text (`text`)

```ts
defineField({
  name: 'summary',
  type: 'text',
  rows: 4,
  validation: (Rule) => Rule.max(300),
})
```

## Number (`number`)

```ts
defineField({
  name: 'price',
  type: 'number',
  validation: (Rule) => Rule.required().min(0),
})
```

## Boolean (`boolean`)

```ts
defineField({
  name: 'featured',
  type: 'boolean',
  initialValue: false,
})
```

## Date (`date`)

```ts
defineField({
  name: 'publishDate',
  type: 'date',
  options: {
    dateFormat: 'YYYY-MM-DD',
  },
})
```

## Datetime (`datetime`)

```ts
defineField({
  name: 'publishAt',
  type: 'datetime',
  options: {
    timeStep: 15,
  },
})
```

## URL (`url`)

```ts
defineField({
  name: 'website',
  type: 'url',
  validation: (Rule) =>
    Rule.uri({
      allowRelative: false,
      scheme: ['http', 'https', 'mailto', 'tel'],
    }),
})
```

## Slug (`slug`)

```ts
defineField({
  name: 'slug',
  type: 'slug',
  options: {
    source: 'title',
    maxLength: 96,
    slugify: (input) =>
      input
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .slice(0, 96),
    // Optional uniqueness override:
    // isUnique: async (slug, context) => { ... },
  },
  validation: (Rule) => Rule.required(),
})
```

## Array (`array`)

```ts
defineField({
  name: 'faqItems',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'object',
      fields: [
        defineField({name: 'question', type: 'string'}),
        defineField({name: 'answer', type: 'text'}),
      ],
      preview: {select: {title: 'question'}},
    }),
  ],
  validation: (Rule) => Rule.min(1),
})
```

Important: Do not mix primitive members and object members in one `of` array. Use one style per field.

## Reference (`reference`)

```ts
defineField({
  name: 'author',
  type: 'reference',
  to: [{type: 'person'}],
  options: {
    filter: '_type == "person" && active == true',
  },
  weak: false,
})
```

## Cross Dataset Reference (`crossDatasetReference`)

```ts
defineField({
  name: 'externalAuthor',
  title: 'External Author',
  type: 'crossDatasetReference',
  dataset: 'production',
  studioUrl: ({type, id}) => `https://target-studio.example.com/structure/${type};${id}`,
  to: [
    {
      type: 'person',
      preview: {
        select: {title: 'name'},
      },
    },
  ],
})
```

## Global Document Reference (`globalDocumentReference`)

```ts
defineField({
  name: 'photographer',
  title: 'Photographer',
  type: 'globalDocumentReference',
  resourceType: 'dataset',
  resourceId: 'yourProjectId.production',
  to: [{type: 'photographer'}],
  weak: true,
})
```

## Image (`image`)

```ts
defineField({
  name: 'heroImage',
  type: 'image',
  options: {
    hotspot: true,
    metadata: ['lqip', 'blurhash', 'palette'],
    accept: 'image/*',
  },
  fields: [
    defineField({name: 'alt', type: 'string', validation: (Rule) => Rule.required()}),
  ],
})
```

## File (`file`)

```ts
defineField({
  name: 'brochure',
  type: 'file',
  options: {
    accept: '.pdf',
  },
  fields: [
    defineField({name: 'title', type: 'string'}),
  ],
})
```

## Geopoint (`geopoint`)

```ts
defineField({
  name: 'location',
  type: 'geopoint',
})
```

## Block (`block`) for Portable Text

```ts
defineField({
  name: 'content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [defineField({name: 'href', type: 'url'})],
          },
        ],
      },
    }),
    defineArrayMember({type: 'image'}),
  ],
})
```

## Span (`span`)

`span` is part of Portable Text block internals and is usually not defined manually.
You configure marks and annotations on `block`, then Studio stores spans automatically.

## Common Field Patterns

### Validation

```ts
validation: (Rule) => Rule.required().error('This field is required')
```

### Conditional Fields

```ts
hidden: ({document}) => !document?.featured
readOnly: ({currentUser}) => !currentUser?.roles?.some((r) => r.name === 'administrator')
```

### Initial Values

```ts
initialValue: 'default text'
```

### Groups and Fieldsets

```ts
groups: [
  {name: 'content', title: 'Content', default: true},
  {name: 'seo', title: 'SEO'},
]

// On fields:
group: 'seo'
```

```ts
fieldsets: [{name: 'legacy', title: 'Legacy', options: {collapsible: true, collapsed: true}}]

// On fields:
fieldset: 'legacy'
```

### List Preview and Sorting

```ts
preview: {
  select: {title: 'title', subtitle: 'slug.current', media: 'heroImage'},
  prepare: ({title, subtitle, media}) => ({title, subtitle, media}),
},

orderings: [
  {
    title: 'Title A-Z',
    name: 'titleAsc',
    by: [{field: 'title', direction: 'asc'}],
  },
]
```

## Register Types in `sanity.config.ts`

```ts
import {defineConfig} from 'sanity'
import {article} from './src/sanity/schemaTypes/article'
import {cta} from './src/sanity/schemaTypes/cta'

export default defineConfig({
  // ...
  schema: {
    types: [article, cta],
  },
})
```
