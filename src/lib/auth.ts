import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentAccount() {
  const session = await getSession();
  if (!session) return null;
  return prisma.account.findUnique({ where: { id: session.accountId } });
}

export async function requireAdmin() {
  const account = await getCurrentAccount();
  if (!account || account.role !== "ADMIN") return null;
  return account;
}
