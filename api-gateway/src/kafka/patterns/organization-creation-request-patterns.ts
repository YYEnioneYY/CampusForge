export const ORGANIZATION_CREATION_REQUEST_PATTERNS = {
  CREATE_DRAFT: 'organization.creation_request.draft.create',

  GET_MY: 'organization.creation_request.my',

  UPDATE_DRAFT: 'organization.creation_request.draft.update',

  SUBMIT: 'organization.creation_request.submit',

  DELETE_DRAFT: 'organization.creation_request.draft.delete',
} as const;

export const ORGANIZATION_CREATION_REQUEST_RESPONSE_PATTERNS = [
  ORGANIZATION_CREATION_REQUEST_PATTERNS.CREATE_DRAFT,

  ORGANIZATION_CREATION_REQUEST_PATTERNS.GET_MY,

  ORGANIZATION_CREATION_REQUEST_PATTERNS.UPDATE_DRAFT,

  ORGANIZATION_CREATION_REQUEST_PATTERNS.SUBMIT,

  ORGANIZATION_CREATION_REQUEST_PATTERNS.DELETE_DRAFT,
] as const;