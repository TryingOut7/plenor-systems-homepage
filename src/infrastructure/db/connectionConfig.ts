/**
 * Infrastructure-layer database connection helpers.
 *
 * API routes import from here instead of @/lib/env-validation directly,
 * keeping the lib layer out of the controller (API route) layer.
 */
export { resolveDbConnectionString } from '@/lib/env-validation';
