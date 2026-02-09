import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";


export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}


export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }


  const token = authHeader.split(" ")[1];

  try {

    const payload = verifyToken(token);


    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
