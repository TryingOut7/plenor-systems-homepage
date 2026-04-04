import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  createWorkspaceFormTemplate,
  getSupportedFormTemplateKeysLabel,
  parseRequestedFormTemplateKey,
} from '@/application/forms/formTemplateService';
import {
  createPayloadFormTemplateRepository,
} from '@/infrastructure/forms/payloadFormTemplateRepository';
import { proxyRequestToBackend } from '@/infrastructure/http/backendProxy';
import { readJsonBody, requireWorkspaceUser, toApiErrorResponse } from '../../../pages/_shared';

export async function POST(request: NextRequest) {
  const proxied = await proxyRequestToBackend(request, '/v1/forms/templates/create');
  if (proxied) {
    return proxied;
  }

  const { payload, user, errorResponse } = await requireWorkspaceUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const body = await readJsonBody(request);
  const templateKey = parseRequestedFormTemplateKey(body.templateKey);
  if (!templateKey) {
    return NextResponse.json(
      {
        success: false,
        message: `templateKey must be one of: ${getSupportedFormTemplateKeysLabel()}.`,
      },
      { status: 400 },
    );
  }

  try {
    const repository = createPayloadFormTemplateRepository({ payload, user });
    const form = await createWorkspaceFormTemplate(repository, templateKey);

    return NextResponse.json({
      success: true,
      form,
    });
  } catch (error) {
    return toApiErrorResponse(error, 'Failed to create form template.');
  }
}
