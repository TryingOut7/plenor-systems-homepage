import type { Block } from 'payload';
import { sectionCommonFields } from '../../fields/sectionCommon.ts';

export const OrgSponsorsSection: Block = {
  slug: 'orgSponsorsSection',
  dbName: 'org_sponsors_sec',
  labels: { singular: 'Org Sponsors', plural: 'Org Sponsors Blocks' },
  fields: [
    ...sectionCommonFields,
  ],
};
