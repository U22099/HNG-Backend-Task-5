import { prisma } from "../prisma";

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phoneNumber: true,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!user) throw new Error("User not found");

  return {
    user_id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    role: user.role,
    phone_number: user.phoneNumber,
    is_active: user.isActive,
    email_verified: user.emailVerified,
    phone_verified: user.phoneVerified,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
export async function getUserContact(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      pushToken: true,
      prefersEmail: true,
      prefersPush: true,
      pushTokenLastUpdated: true,
    },
  });

  if (!user) throw new Error("User not found");

  return {
    user_id: user.id,
    email: user.email,
    phone_number: user.phoneNumber,
    push_token: user.pushToken,
    prefers_email: user.prefersEmail,
    prefers_push: user.prefersPush,
    push_token_last_updated: user.pushTokenLastUpdated,
  };
}

export async function updateUser(userId: string, data: any) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      phoneNumber: data.phoneNumber || undefined,
      emailVerified: data.emailVerified || undefined,
      phoneVerified: data.phoneVerified || undefined,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      updatedAt: true,
    }
  });
  
  if(!updatedUser) throw new Error("User not found");

  return {
    id: updatedUser.id,
    updated_at: updatedUser.updatedAt,
  };
}

export async function updateUserContact(userId: string, data: any) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      prefersEmail: data.prefersEmail || undefined,
      prefersPush: data.prefersPush || undefined,
      updatedAt: new Date(),
    }
  });
  
  if(!updatedUser) throw new Error("User not found");

  return updatedUser ? true : false;
}