import { eq } from "drizzle-orm";
import { users, type SafeUser, type User } from "@shared/schema";
import { getDb } from "./db";

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  return rows[0];
}

export async function findUserById(id: string): Promise<User | undefined> {
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  displayName?: string | null;
}): Promise<SafeUser> {
  const db = getDb();
  const rows = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      displayName: input.displayName?.trim() || null,
    })
    .returning();
  return toSafeUser(rows[0]);
}
