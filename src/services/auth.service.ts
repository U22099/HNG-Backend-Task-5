import { prisma } from "../prisma";
import bcrypt from "bcrypt";

export async function register(body: any) {
  try {
    const { email, password, first_name, last_name, phone_number } = body;

    if (!email || !password || !first_name || !last_name)
      throw new Error("Missing required fields");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: first_name,
        lastName: last_name,
        phoneNumber: phone_number,
      },
    });

    return { user_id: user.id, email: user.email, created_at: user.createdAt };
  } catch (error) {
    console.error("Error in register:", error);
    throw new Error("Registration failed");
  }
}

export async function login(fastify: any, body: any) {
  try {
    const { email, password } = body;

    if (!email || !password) throw new Error("Missing email or password");

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new Error("Invalid credentials");
    }

    const access_token = fastify.jwt.sign(
      {
        type: "access",
        sub: user.id,
        user_id: user.id,
        role: "user",
        iss: "user-service",
        aud: "notification-gateway",
        email: user.email,
      },
      { expiresIn: '1h' }
    );

    const refresh_token = fastify.jwt.sign(
      {
        type: "refresh",
        sub: user.id,
        user_id: user.id,
        role: "user",
        iss: "user-service",
        aud: "notification-gateway",
        email: user.email,
      },
      { expiresIn: '1h' }
    );

    return {
      access_token,
      refresh_token,
      expiresIn: 3600,
      token_type: "Bearer",
      user_id: user.id,
    };
  } catch (error) {
    console.error("Error in login:", error);
    throw new Error("Login failed");
  }
}
