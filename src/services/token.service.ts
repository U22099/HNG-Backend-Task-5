import { FastifyInstance } from "fastify";
import { prisma } from "../prisma";
import { CustomError } from "../utils/errors";

export async function refreshToken(fastify: FastifyInstance, body: any) {
  try {
    if (!body.refresh_token) throw new CustomError("Missing refresh token");

    const { refresh_token: token } = body;

    const payload = fastify.jwt.verify(token) as any;
    if (payload.type !== "refresh") throw new CustomError("Unauthorised");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.refreshToken !== token)
      throw new CustomError("Unauthorised");

    const access_token = fastify.jwt.sign(
      { sub: user.id, user_id: user.id, email: user.email },
      { expiresIn: "1h" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: access_token
      }
    })

    return { access_token , expires_in: 3600 };
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new Error("Unauthorised");
  }
}
