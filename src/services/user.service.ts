import { prisma } from "../prisma";

export async function getContact(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      pushToken: true,
      prefersEmail: true,
      prefersPush: true,
      prefersSms: true,
      isActive: true,
      emailVerified: true,
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
    prefers_sms: user.prefersSms,
    is_active: user.isActive,
    email_verified: user.emailVerified,
  };
}
