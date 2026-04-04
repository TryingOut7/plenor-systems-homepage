import type { CollectionBeforeChangeHook } from 'payload';

type SectionRecord = Record<string, unknown>;

const GUIDE_BLOCK_TYPE = 'guideFormSection';
const INQUIRY_BLOCK_TYPE = 'inquiryFormSection';

function asSectionArray(value: unknown): SectionRecord[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => !!entry && typeof entry === 'object')
    .map((entry) => ({ ...(entry as SectionRecord) }));
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function joinParagraphs(values: Array<string | undefined>): string {
  const normalized = values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
  return normalized.join('\n\n');
}

function buildInquirySubheading(section: SectionRecord): string {
  const subtext = readString(section.subtext);
  const nextStepsLabel = readString(section.nextStepsLabel);
  const nextStepsBody = readString(section.nextStepsBody);
  const directEmailLabel = readString(section.directEmailLabel);
  const emailAddress = readString(section.emailAddress);
  const linkedinLabel = readString(section.linkedinLabel);
  const linkedinHref = readString(section.linkedinHref);

  const nextSteps = nextStepsLabel && nextStepsBody
    ? `${nextStepsLabel}: ${nextStepsBody}`
    : nextStepsBody || '';

  const directEmail = directEmailLabel && emailAddress
    ? `${directEmailLabel}: ${emailAddress}`
    : emailAddress || '';

  const linkedin = linkedinHref
    ? `${linkedinLabel || 'LinkedIn'}: ${linkedinHref}`
    : '';

  return joinParagraphs([subtext, nextSteps, directEmail, linkedin]);
}

function convertGuideToFormSection(
  section: SectionRecord,
  guideFormId: number | string,
): SectionRecord {
  const next = { ...section };
  next.blockType = 'formSection';
  next.form = guideFormId;
  if (!readString(next.sectionLabel)) {
    const label = readString(section.label);
    if (label) next.sectionLabel = label;
  }
  next.heading = readString(section.heading);
  next.subheading = joinParagraphs([readString(section.highlightText), readString(section.body)]);

  delete next.label;
  delete next.highlightText;
  delete next.body;
  delete next.emailTemplate;
  return next;
}

function convertInquiryToFormSection(
  section: SectionRecord,
  inquiryFormId: number | string,
): SectionRecord {
  const next = { ...section };
  next.blockType = 'formSection';
  next.form = inquiryFormId;
  if (!readString(next.sectionLabel)) {
    const label = readString(section.label);
    if (label) next.sectionLabel = label;
  }
  next.heading = readString(section.heading);
  next.subheading = buildInquirySubheading(section);

  delete next.label;
  delete next.subtext;
  delete next.nextStepsLabel;
  delete next.nextStepsBody;
  delete next.directEmailLabel;
  delete next.emailAddress;
  delete next.linkedinLabel;
  delete next.linkedinHref;
  return next;
}

function hasGuideInquirySections(sectionsInput: unknown): boolean {
  const sections = asSectionArray(sectionsInput);
  return sections.some((section) => {
    const blockType = readString(section.blockType);
    return blockType === GUIDE_BLOCK_TYPE || blockType === INQUIRY_BLOCK_TYPE;
  });
}

function migrateGuideInquirySections(
  sectionsInput: unknown,
  formIds: {
    guideFormId: number | string;
    inquiryFormId: number | string;
  },
): {
  sections: SectionRecord[];
  convertedCount: number;
} {
  const sections = asSectionArray(sectionsInput);
  let convertedCount = 0;

  const nextSections = sections.map((section) => {
    const blockType = readString(section.blockType);
    if (blockType === GUIDE_BLOCK_TYPE) {
      convertedCount += 1;
      return convertGuideToFormSection(section, formIds.guideFormId);
    }
    if (blockType === INQUIRY_BLOCK_TYPE) {
      convertedCount += 1;
      return convertInquiryToFormSection(section, formIds.inquiryFormId);
    }
    return section;
  });

  return { sections: nextSections, convertedCount };
}

async function resolveDefaultFormIds(): Promise<{
  guideFormId: number | string;
  inquiryFormId: number | string;
}> {
  const [{ getGuideFormId, getInquiryFormId }] = await Promise.all([
    import('../../lib/payload-form-stubs.ts'),
  ]);

  const [guideFormId, inquiryFormId] = await Promise.all([
    getGuideFormId(),
    getInquiryFormId(),
  ]);

  return { guideFormId, inquiryFormId };
}

async function migrateGuideInquirySectionsWithDefaultForms(
  sectionsInput: unknown,
): Promise<{
  sections: SectionRecord[];
  convertedCount: number;
}> {
  if (!hasGuideInquirySections(sectionsInput)) {
    return { sections: asSectionArray(sectionsInput), convertedCount: 0 };
  }

  const formIds = await resolveDefaultFormIds();
  return migrateGuideInquirySections(sectionsInput, formIds);
}

export const migrateGuideInquirySectionsBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  operation,
}) => {
  if (!data || typeof data !== 'object') return data;
  if (operation !== 'create' && operation !== 'update') return data;

  const incoming = { ...(data as SectionRecord) };
  if (!hasGuideInquirySections(incoming.sections)) return incoming;

  const migration = await migrateGuideInquirySectionsWithDefaultForms(incoming.sections);
  if (migration.convertedCount === 0) return incoming;

  return {
    ...incoming,
    sections: migration.sections,
  };
};
