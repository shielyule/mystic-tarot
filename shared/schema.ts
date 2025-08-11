import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const decks = pgTable("decks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  theme: text("theme"),
  cardBackImageUrl: text("card_back_image_url"),
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tarotCards = pgTable("tarot_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deckId: varchar("deck_id").references(() => decks.id).notNull(),
  name: text("name").notNull(),
  arcana: text("arcana").notNull(), // "major" or "minor"
  suit: text("suit"), // "wands", "cups", "swords", "pentacles" for minor arcana
  number: integer("number"), // 0-21 for major, 1-14 for minor
  imageUrl: text("image_url"),
  uprightMeaning: text("upright_meaning"),
  reversedMeaning: text("reversed_meaning"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
});

export const readings = pgTable("readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").references(() => tarotCards.id).notNull(),
  interpretation: text("interpretation"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const customUploads = pgTable("custom_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deckId: varchar("deck_id").references(() => decks.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileUrl: text("file_url").notNull(),
  cardType: text("card_type").notNull(), // "major_arcana", "minor_arcana", "card_back"
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
});

export const insertDeckSchema = createInsertSchema(decks).omit({
  id: true,
  createdAt: true,
});

export const insertTarotCardSchema = createInsertSchema(tarotCards).omit({
  id: true,
});

export const insertReadingSchema = createInsertSchema(readings).omit({
  id: true,
  timestamp: true,
});

export const insertCustomUploadSchema = createInsertSchema(customUploads).omit({
  id: true,
  uploadedAt: true,
});

export type InsertDeck = z.infer<typeof insertDeckSchema>;
export type InsertTarotCard = z.infer<typeof insertTarotCardSchema>;
export type InsertReading = z.infer<typeof insertReadingSchema>;
export type InsertCustomUpload = z.infer<typeof insertCustomUploadSchema>;

export type Deck = typeof decks.$inferSelect;
export type TarotCard = typeof tarotCards.$inferSelect;
export type Reading = typeof readings.$inferSelect;
export type CustomUpload = typeof customUploads.$inferSelect;
