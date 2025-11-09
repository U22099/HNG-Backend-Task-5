import bcrypt from 'bcrypt';

export const hashPassword = async (plain: string): Promise<string> =>
  bcrypt.hash(plain, 12);

export const verifyPassword = async (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);