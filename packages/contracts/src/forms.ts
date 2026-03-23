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

export interface FormSubmissionSuccessResponse {
  success: true;
}

export interface FormSubmissionErrorResponse {
  message: string;
}
