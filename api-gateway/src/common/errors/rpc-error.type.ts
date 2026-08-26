export type RpcValidationErrorDetail = {
  field: string;
  messages: string[];
};

export type RpcErrorPayload = {
  code: string;
  message: string;

  details?: RpcValidationErrorDetail[];
};