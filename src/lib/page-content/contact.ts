import type { PageSection } from '@/payload/cms';
import { asTrimmedString, findSection } from '@/lib/page-content/helpers';

export interface ContactPageData {
  heroLabel?: string;
  heroHeading?: string;
  heroSubtext?: string;
  guideLabel?: string;
  guideHeading?: string;
  guideHighlightText?: string;
  guideBody?: string;
  inquiryLabel?: string;
  inquiryHeading?: string;
  inquirySubtext?: string;
  nextStepsLabel?: string;
  nextStepsBody?: string;
  directEmailLabel?: string;
  emailAddress?: string;
  linkedinLabel?: string;
  linkedinHref?: string;
  privacyNoteLabel?: string;
  privacyPolicyLabel?: string;
  privacyPolicyHref?: string;
}

export const CONTACT_PAGE_DEFAULTS: Required<ContactPageData> = {
  heroLabel: 'Contact',
  heroHeading: 'Let’s talk.',
  heroSubtext: 'Tell us about your product and team and we’ll get back to you within 2 business days.',
  guideLabel: 'Free resource',
  guideHeading: 'Get the free guide',
  guideHighlightText: 'The 7 Most Common Product Development Mistakes — and How to Avoid Them.',
  guideBody:
    'The guide covers the specific errors teams make in Testing & QA and Launch & Go-to-Market, and what to do instead. Enter your name and email and the PDF is sent to your inbox automatically.',
  inquiryLabel: 'Send an inquiry',
  inquiryHeading: 'Send a direct inquiry',
  inquirySubtext:
    'Tell us about your product, your team, and the challenge you’re working through. We’ll respond within 2 business days.',
  nextStepsLabel: 'What happens next',
  nextStepsBody:
    'We review every inquiry and respond within 2 business days with initial thoughts or a proposal request.',
  directEmailLabel: 'Prefer email directly?',
  emailAddress: '',
  linkedinLabel: 'LinkedIn',
  linkedinHref: '',
  privacyNoteLabel: 'By submitting this form, you agree to our',
  privacyPolicyLabel: 'Privacy Policy',
  privacyPolicyHref: '/privacy',
};

export function resolveContactPageData(
  sections: PageSection[] | null | undefined,
): Required<ContactPageData> {
  const safeSections = Array.isArray(sections) ? sections : [];
  const guide = safeSections.find(
    (section) =>
      section.blockType === 'formSection' &&
      String(section.structuralKey || '').trim() === 'contact-guide-form',
  ) || findSection(safeSections, 'guideFormSection');
  const inquiry = safeSections.find(
    (section) =>
      section.blockType === 'formSection' &&
      String(section.structuralKey || '').trim() === 'contact-inquiry-form',
  ) || findSection(safeSections, 'inquiryFormSection');
  const hero = findSection(safeSections, 'heroSection');
  const privacyNote = findSection(safeSections, 'privacyNoteSection');

  return {
    ...CONTACT_PAGE_DEFAULTS,
    heroLabel: asTrimmedString(hero?.eyebrow) || CONTACT_PAGE_DEFAULTS.heroLabel,
    heroHeading: asTrimmedString(hero?.heading) || CONTACT_PAGE_DEFAULTS.heroHeading,
    heroSubtext: asTrimmedString(hero?.subheading) || CONTACT_PAGE_DEFAULTS.heroSubtext,
    guideLabel:
      asTrimmedString(guide?.sectionLabel) ||
      asTrimmedString(guide?.label) ||
      CONTACT_PAGE_DEFAULTS.guideLabel,
    guideHeading: asTrimmedString(guide?.heading) || CONTACT_PAGE_DEFAULTS.guideHeading,
    guideHighlightText:
      asTrimmedString(guide?.highlightText) ||
      asTrimmedString(String(guide?.subheading || '').split('\n\n')[0]) ||
      CONTACT_PAGE_DEFAULTS.guideHighlightText,
    guideBody:
      asTrimmedString(guide?.body) ||
      asTrimmedString(String(guide?.subheading || '').split('\n\n').slice(1).join('\n\n')) ||
      CONTACT_PAGE_DEFAULTS.guideBody,
    inquiryLabel:
      asTrimmedString(inquiry?.sectionLabel) ||
      asTrimmedString(inquiry?.label) ||
      CONTACT_PAGE_DEFAULTS.inquiryLabel,
    inquiryHeading: asTrimmedString(inquiry?.heading) || CONTACT_PAGE_DEFAULTS.inquiryHeading,
    inquirySubtext:
      asTrimmedString(inquiry?.subtext) ||
      asTrimmedString(String(inquiry?.subheading || '').split('\n\n')[0]) ||
      CONTACT_PAGE_DEFAULTS.inquirySubtext,
    nextStepsLabel: asTrimmedString(inquiry?.nextStepsLabel) || CONTACT_PAGE_DEFAULTS.nextStepsLabel,
    nextStepsBody:
      asTrimmedString(inquiry?.nextStepsBody) ||
      asTrimmedString(String(inquiry?.subheading || '').split('\n\n')[1]) ||
      CONTACT_PAGE_DEFAULTS.nextStepsBody,
    directEmailLabel: asTrimmedString(inquiry?.directEmailLabel) || CONTACT_PAGE_DEFAULTS.directEmailLabel,
    emailAddress: asTrimmedString(inquiry?.emailAddress) || CONTACT_PAGE_DEFAULTS.emailAddress,
    linkedinLabel: asTrimmedString(inquiry?.linkedinLabel) || CONTACT_PAGE_DEFAULTS.linkedinLabel,
    linkedinHref: asTrimmedString(inquiry?.linkedinHref) || CONTACT_PAGE_DEFAULTS.linkedinHref,
    privacyNoteLabel: asTrimmedString(privacyNote?.label) || CONTACT_PAGE_DEFAULTS.privacyNoteLabel,
    privacyPolicyLabel:
      asTrimmedString(privacyNote?.policyLinkLabel) || CONTACT_PAGE_DEFAULTS.privacyPolicyLabel,
    privacyPolicyHref:
      asTrimmedString(privacyNote?.policyLinkHref) || CONTACT_PAGE_DEFAULTS.privacyPolicyHref,
  };
}
