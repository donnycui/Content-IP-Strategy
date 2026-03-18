export class ServiceError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}

export function getServiceErrorStatus(error: unknown) {
  if (error instanceof ServiceError) {
    return error.status;
  }

  return 500;
}
