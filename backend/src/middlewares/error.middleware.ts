import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: any[] = [];

  // Handle ApiError (our custom error)
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;

    // Handle Prisma known request errors
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        // Unique constraint violation
        const fields = (err.meta?.target as string[])?.join(", ") ?? "field";
        statusCode = 409;
        message = `A record with this ${fields} already exists`;
        break;
      }
      case "P2025":
        // Record not found
        statusCode = 404;
        message = "Record not found";
        break;
      case "P2003":
        // Foreign key constraint failure
        statusCode = 400;
        message = "Related record not found";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
        break;
    }

    // Handle Prisma validation errors
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";

    // Handle JWT errors
  } else if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token has expired";
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (err instanceof jwt.NotBeforeError) {
    statusCode = 401;
    message = "Token not yet valid";

    // Handle generic errors
  } else if (err instanceof Error) {
    message = err.message || "Something went wrong";
    statusCode = (err as NodeJS.ErrnoException & { statusCode?: number }).statusCode ?? 500;
  }

  // Always log errors
  logger.error(
    {
      statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      err,
    },
    message
  );

  const response: Record<string, unknown> = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  };

  return res.status(statusCode).json(response);
};
