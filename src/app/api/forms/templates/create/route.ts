import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createOrGetFormTemplate } from '@/payload/forms/formTemplateCreation';
import { resolveFormTemplate } from '@/payload/forms/formTemplates';
import { readJsonBody, requireWorkspaceUser, toApiErrorResponse } from '../../../pages/_shared';

export async function POST(request: NextRequest) {
  const { payload, user, errorResponse } = await requireWorkspaceUser(request);
  if (errorResponse || !user) return errorResponse as NextResponse;

  const body = await readJsonBody(request);
  const templateKey = typeof body.templateKey === 'string' ? body.templateKey.trim() : '';

  const template = resolveFormTemplate(templateKey);
  if (!template) {
    return NextResponse.json(
      { success: false, message: 'templateKey must be one of: guide, inquiry, newsletter.' },
      { status: 400 },
    );
  }

  try {
    const form = await createOrGetFormTemplate({
      payload,
      templateKey: template.key,
      user,
    });

    return NextResponse.json({
      success: true,
      form,
    });
  } catch (error) {
    return toApiErrorResponse(error, 'Failed to create form template.');
  }
}
