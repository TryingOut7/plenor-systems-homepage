import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon';

export const DynamicListSection: Block = {
  slug: 'dynamicListSection',
  dbName: 'dyn_list',
  labels: { singular: 'Dynamic List', plural: 'Dynamic Lists' },
  fields: [
    ...sectionCommonFields,
    { name: 'heading', type: 'text' },
    {
      name: 'source',
      type: 'select',
      dbName: 'dl_source',
      required: true,
      options: [
        { label: 'Services', value: 'serviceItem' },
        { label: 'Blog Posts', value: 'blogPost' },
        { label: 'Testimonials', value: 'testimonial' },
      ],
    },
    {
      name: 'viewMode',
      type: 'select',
      dbName: 'dl_view_mode',
      defaultValue: 'cards',
      options: [
        { label: 'Cards', value: 'cards' },
        { label: 'List', value: 'list' },
        { label: 'Table', value: 'table' },
      ],
    },
    { name: 'filterField', type: 'text' },
    { name: 'filterValue', type: 'text' },
    { name: 'sortField', type: 'text', defaultValue: 'publishedAt' },
    {
      name: 'sortDirection',
      type: 'select',
      dbName: 'dl_sort_dir',
      defaultValue: 'desc',
      options: [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' },
      ],
    },
    { name: 'limit', type: 'number', defaultValue: 6 },
    { name: 'enablePagination', type: 'checkbox', defaultValue: true },
  ],
};
