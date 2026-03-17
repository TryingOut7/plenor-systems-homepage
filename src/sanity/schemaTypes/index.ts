import { homePage } from './homePage';
import { servicesPage } from './servicesPage';
import { pricingPage } from './pricingPage';
import { aboutPage } from './aboutPage';
import { contactPage } from './contactPage';
import { seoFields } from './objects/seoFields';
import { sitePage } from './sitePage';
import { siteSettings } from './siteSettings';
import { blogPost } from './blogPost';
import { serviceItem } from './serviceItem';
import { testimonial } from './testimonial';
import { redirectRule } from './redirectRule';
import { reusableSection } from './reusableSection';

export const schemaTypes = [
  seoFields,
  siteSettings,
  sitePage,
  reusableSection,
  blogPost,
  serviceItem,
  testimonial,
  redirectRule,
  homePage,
  servicesPage,
  pricingPage,
  aboutPage,
  contactPage,
];
