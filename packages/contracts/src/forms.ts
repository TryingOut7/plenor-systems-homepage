import type { BackendErrorResponse } from './errors';

export interface GuideSubmissionRequest {
  name?: string;
  email?: string;
  templateId?: string | number;
}

export interface InquirySubmissionRequest {
  name?: string;
  email?: string;
  organization?: string;
  inquiryType?: string;
  message?: string;
  company?: string;
  challenge?: string;
}

export interface FormSubmissionSuccessResponse {
  success: true;
}

export interface FormSubmissionErrorResponse {
  message: string;
  success?: BackendErrorResponse['success'];
  code?: BackendErrorResponse['code'];
  status?: BackendErrorResponse['status'];
  requestId?: BackendErrorResponse['requestId'];
  retryAfterSeconds?: BackendErrorResponse['retryAfterSeconds'];
  details?: BackendErrorResponse['details'];
  error?: string;
}
