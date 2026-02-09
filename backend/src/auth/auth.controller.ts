import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body;
  const user = await AuthService.register(name, email, password);

  res.status(201).json({
    message: "User registered successfully",
    ...user,
  });
};

export const loginCrontroller=async(
  req:Request,
  res:Response
):Promise<void>=>{
  const {email,password}=req.body;
  const user =await AuthService.login(email,password)

  res.status(201).json({
    message:"User logged-in successfully",
    ...user,
  })
}
