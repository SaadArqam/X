import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export class AuthService{
     static async register(
    name: string,
    email: string,
    password: string
  ){
    const existingUser=await prisma.user.findUnique({
        where:{email}
    })
    if(existingUser) throw new ApiError(400, "Email already registered"); 

    const hashedPassword=await bcrypt.hash(password,10)

    const user=await prisma.user.create({
        data:{
            name,
            email,
            password:hashedPassword
        }
    })

    return {
        id:user.id,
        name:user.name,
        email:user.email,
        role: user.role
    }
  }
}
