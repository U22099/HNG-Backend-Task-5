import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import { CustomError } from "../utils/errors";

export async function register(body: any) {
  try {
    const { email, password, first_name, last_name, phone_number } = body;

    if (!email || !password || !first_name || !last_name)
      throw new CustomError("Missing required fields");

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
  } catch (error: any) {
    console.error("Error in register:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new Error("Registration failed");
  }
}

export async function login(fastify: FastifyInstance, body: any) {
  try {
    const { email, password } = body;

    if (!email || !password) throw new CustomError("Missing email or password");

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new CustomError("Invalid credentials");
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: access_token,
        refreshToken: refresh_token
      }
    })

    return {
      access_token,
      refresh_token,
      expires_in: 3600,
      token_type: "Bearer",
      user_id: user.id,
    };
  } catch (error: any) {
    console.error("Error in login:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new Error("Login failed");
  }
}

export async function logout(fastify: FastifyInstance, headers: FastifyRequest['headers']) {
  try {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    const payload = fastify.jwt.verify(token || "") as any;
    if (!payload || !payload.exp) {
      throw new CustomError('Invalid token payload on request.user');
    }

    const user = await prisma.user.findFirst({
      where: {
        accessToken: token!,
      },
    });

    if(!user) throw new CustomError('User not found for provided token');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: null,
        refreshToken: null
      }
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error: any) {
    console.error('Error in logout:', error);
    if (error instanceof CustomError) {
      throw error;
    }

    if (error.code === 'P2002') {
      return { success: true, message: 'Already logged out' };
    }
    
    throw new Error('Logout failed');
  }
}