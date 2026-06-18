import { desc, eq } from "drizzle-orm";
import { spreadReadings, type InsertSpreadReading, type SpreadReading } from "@shared/schema";
import { getDb } from "./db";

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export async function createSpreadReadingForUser(
  userId: string,
  data: Omit<InsertSpreadReading, "userId">,
): Promise<SpreadReading> {
  const db = getDb();
  const rows = await db
    .insert(spreadReadings)
    .values({
      userId,
      operatorName: data.operatorName ?? null,
      subject: data.subject ?? null,
      deckId: data.deckId ?? null,
      deckName: data.deckName ?? null,
      cardNames: asStringArray(data.cardNames),
      reading: data.reading,
    })
    .returning();
  return rows[0];
}

export async function getSpreadReadingsByUser(userId: string, limit = 20): Promise<SpreadReading[]> {
  const db = getDb();
  return db
    .select()
    .from(spreadReadings)
    .where(eq(spreadReadings.userId, userId))
    .orderBy(desc(spreadReadings.timestamp))
    .limit(limit);
}
