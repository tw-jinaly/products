import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: ZodType, target: ValidationTarget = "body") =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const result = await schema.safeParseAsync(req[target]);

    if (!result.success) {
      next(result.error);
      return;
    }

    req[target] = result.data;
    next();
  };
