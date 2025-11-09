import { FastifyRequest } from "fastify";
import { prisma } from "../prisma";

export const authorize = async (headers: FastifyRequest['headers']) => {
    const token = headers.authorization?.split(" ")[1];
    if (!token)
      throw new Error("Unauthorised");
    const user = await prisma.user.findFirst({
      where: { accessToken: token },
    });
    if (!user) throw new Error("Unauthorised");

    return token;
}