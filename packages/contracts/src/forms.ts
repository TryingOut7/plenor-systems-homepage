import type { BackendErrorResponse } from './errors';

export interface GuideSubmissionRequest {
  name?: string;
  email?: string;
  templateId?: string | number;
}

export interface InquirySubmissionRequest {
  name?: string;
  email?: string;
  company?: string;
  challenge?: string;
}

export type RegistrationStatus =
  | 'submitted'
  | 'payment_pending'
  | 'payment_confirmation_submitted'
  | 'payment_confirmed'
  | 'registration_confirmed'
  | 'cancelled_rejected';

export interface RegistrationContactPreferences {
  email?: boolean;
  sms?: boolean;
  phone?: boolean;
  preferredChannel?: 'email' | 'sms' | 'phone';
}

export interface RegistrationSubmissionRequest {
  eventId?: string;
  name?: string;
  email?: string;
  participantCount?: number;
  instrument?: string;
  ageGroup?: string;
  contactPreferences?: RegistrationContactPreferences;
}

export interface RegistrationStatusResponse {
  status: RegistrationStatus;
  userFacingReason?: string | null;
}

export interface RegistrationSubmissionResponse extends RegistrationStatusResponse {
  success: true;
  publicId: string;
}

export interface PaymentConfirmationRequest {
  payerName?: string;
  paymentMethod?: 'zelle' | 'venmo';
  amount?: number;
  paymentDate?: string;
  referenceNote?: string;
}

export interface AdminStatusUpdateRequest {
  status?: RegistrationStatus;
  internalReason?: string;
  userFacingReason?: string;
}

export interface AdminRegistrationSubmission {
  publicId: string;
  eventId: string | null;
  status: RegistrationStatus;
  registrationPayload: {
    name: string;
    email: string;
    participantCount?: number;
    instrument?: string;
    ageGroup?: string;
    contactPreferences?: RegistrationContactPreferences;
  };
  paymentConfirmationPayload?: {
    payerName: string;
    paymentMethod: 'zelle' | 'venmo';
    amount: number;
    paymentDate: string;
    referenceNote?: string;
  } | null;
  internalReason?: string | null;
  userFacingReason?: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface AdminRegistrationSubmissionsListResponse {
  items: AdminRegistrationSubmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    byStatus: Partial<Record<RegistrationStatus, number>>;
  };
}

export interface AdminRegistrationSubmissionDetailResponse {
  submission: AdminRegistrationSubmission;
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
