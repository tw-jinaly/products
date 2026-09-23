export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOprational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);

    this.statusCode = statusCode;
    this.isOprational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
