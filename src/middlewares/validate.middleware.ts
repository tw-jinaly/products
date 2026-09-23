import { NextFunction, Response, Request } from "express";
import z, { ZodError } from "zod";

export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const error = result.error as ZodError;
      const issues = error.issues.map((issue) => ({
        field: issue.path.slice(1).join("."),
        message: issue.message,
      }));

      res.status(400).json({
        status: "fail",
        message: "Invalid input data",
        errors: issues,
      });
      return;
    }

    const data = result.data as Record<string, any>;
    if (data.body) req.body = data.body;
    if (data.query) req.query = data.query;
    if (data.params) req.params = data.params;

    next();
  };
};
