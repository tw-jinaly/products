export interface AppErrorOptions extends ErrorOptions {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, options?: number | AppErrorOptions) {
    const resolvedOptions: AppErrorOptions =
      typeof options === "number" ? { statusCode: options } : options ?? {};

    super(message, { cause: resolvedOptions.cause });

    this.name = this.constructor.name;

    this.statusCode = resolvedOptions.statusCode ?? 500;
    this.isOperational = resolvedOptions.isOperational ?? true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
