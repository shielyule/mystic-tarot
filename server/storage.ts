import { 
  type Deck, 
  type InsertDeck, 
  type TarotCard, 
  type InsertTarotCard, 
  type Reading, 
  type InsertReading,
  type SpreadReading,
  type InsertSpreadReading,
  type CustomUpload,
  type InsertCustomUpload 
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { getRiderWaiteMeaning } from "./rider-waite-seed";

const CARD_FOLDER = path.resolve(import.meta.dirname, "..", "Cards-png");
const DEFAULT_CARD_BACK = "/Cards-png/Roses_and_Lilies_back.jpg";

function formatCardNameFromFilename(filename: string) {
  return filename
    .replace(/\.(png|jpg|jpeg|webp)$/i, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseCardMetadata(filename: string) {
  const base = filename.replace(/\.(png|jpg|jpeg|webp)$/i, "").toLowerCase();
  const normalized = base.replace(/_/g, "-");

  const majorArcanaNumbers: Record<string, number> = {
    "the-fool": 0,
    "the-magician": 1,
    "the-high-priestess": 2,
    "the-empress": 3,
    "the-emperor": 4,
    "the-hierophant": 5,
    "the-lovers": 6,
    "the-chariot": 7,
    strength: 8,
    "the-hermit": 9,
    "wheel-of-fortune": 10,
    justice: 11,
    "the-hanged-man": 12,
    death: 13,
    temperance: 14,
    "the-devil": 15,
    "the-tower": 16,
    "the-star": 17,
    "the-moon": 18,
    "the-sun": 19,
    judgement: 20,
    judgment: 20,
    "the-world": 21,
  };

  if (majorArcanaNumbers[normalized] !== undefined) {
    return {
      arcana: "major" as const,
      suit: null,
      number: majorArcanaNumbers[normalized],
      name: formatCardNameFromFilename(filename),
    };
  }

  const minorMatch = normalized.match(
    /^(ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)-of-(wands|cups|swords|pentacles)$/,
  );

  if (minorMatch) {
    const [, rank, suit] = minorMatch;
    const rankToNumber: Record<string, number> = {
      ace: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      page: 11,
      knight: 12,
      queen: 13,
      king: 14,
    };

    return {
      arcana: "minor" as const,
      suit,
      number: rankToNumber[rank] ?? null,
      name: formatCardNameFromFilename(filename),
    };
  }

  return {
    arcana: "major" as const,
    suit: null,
    number: null,
    name: formatCardNameFromFilename(filename),
  };
}

export interface IStorage {
  // Deck operations
  getDecks(): Promise<Deck[]>;
  getDeck(id: string): Promise<Deck | undefined>;
  createDeck(deck: InsertDeck): Promise<Deck>;
  updateDeck(id: string, deck: Partial<InsertDeck>): Promise<Deck | undefined>;
  deleteDeck(id: string): Promise<boolean>;

  // Tarot card operations
  getCardsByDeck(deckId: string): Promise<TarotCard[]>;
  getCard(id: string): Promise<TarotCard | undefined>;
  createCard(card: InsertTarotCard): Promise<TarotCard>;
  updateCard(id: string, card: Partial<InsertTarotCard>): Promise<TarotCard | undefined>;
  deleteCard(id: string): Promise<boolean>;

  // Reading operations
  getRecentReadings(limit: number): Promise<Reading[]>;
  createReading(reading: InsertReading): Promise<Reading>;

  // Full spread reading history
  getRecentSpreadReadings(limit: number): Promise<SpreadReading[]>;
  createSpreadReading(reading: InsertSpreadReading): Promise<SpreadReading>;

  // Custom upload operations
  getUploadsByDeck(deckId: string): Promise<CustomUpload[]>;
  createUpload(upload: InsertCustomUpload): Promise<CustomUpload>;
  deleteUpload(id: string): Promise<boolean>;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((v): v is string => typeof v === "string");
}

export class MemStorage implements IStorage {
  private decks: Map<string, Deck>;
  private tarotCards: Map<string, TarotCard>;
  private readings: Map<string, Reading>;
  private spreadReadings: Map<string, SpreadReading>;
  private customUploads: Map<string, CustomUpload>;

  constructor() {
    this.decks = new Map();
    this.tarotCards = new Map();
    this.readings = new Map();
    this.spreadReadings = new Map();
    this.customUploads = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default Rider-Waite deck from local Cards-png files.
    const defaultDeckId = randomUUID();
    const defaultDeck: Deck = {
      id: defaultDeckId,
      name: "Rider-Waite-Smith",
      description: "Loaded from local Cards-png folder.",
      theme: "classic",
      cardBackImageUrl: DEFAULT_CARD_BACK,
      isCustom: false,
      createdAt: new Date(),
    };
    this.decks.set(defaultDeckId, defaultDeck);

    const supported = [".png", ".jpg", ".jpeg", ".webp"];
    const filenames = fs.existsSync(CARD_FOLDER)
      ? fs
          .readdirSync(CARD_FOLDER)
          .filter((name) => supported.some((ext) => name.toLowerCase().endsWith(ext)))
          .filter((name) => !name.toLowerCase().includes("back"))
      : [];

    filenames.forEach((filename) => {
      const cardId = randomUUID();
      const cardData = parseCardMetadata(filename);
      const seed = getRiderWaiteMeaning(filename);

      const card: TarotCard = {
        id: cardId,
        deckId: defaultDeckId,
        name: cardData.name,
        arcana: cardData.arcana,
        suit: cardData.suit,
        number: cardData.number,
        imageUrl: `/Cards-png/${filename}`,
        uprightMeaning: seed?.uprightMeaning ?? `A transmission linked to ${cardData.name}.`,
        reversedMeaning: seed?.reversedMeaning ?? null,
        keywords: seed?.keywords ?? null,
      };

      this.tarotCards.set(cardId, card);
    });
  }

  // Deck operations
  async getDecks(): Promise<Deck[]> {
    return Array.from(this.decks.values());
  }

  async getDeck(id: string): Promise<Deck | undefined> {
    return this.decks.get(id);
  }

  async createDeck(insertDeck: InsertDeck): Promise<Deck> {
    const id = randomUUID();
    const deck: Deck = {
      ...insertDeck,
      id,
      createdAt: new Date(),
      description: insertDeck.description ?? null,
      theme: insertDeck.theme ?? null,
      cardBackImageUrl: insertDeck.cardBackImageUrl ?? null,
      isCustom: insertDeck.isCustom ?? false,
    };
    this.decks.set(id, deck);
    return deck;
  }

  async updateDeck(id: string, updateData: Partial<InsertDeck>): Promise<Deck | undefined> {
    const existingDeck = this.decks.get(id);
    if (!existingDeck) return undefined;

    const updatedDeck: Deck = {
      ...existingDeck,
      ...updateData,
    };
    this.decks.set(id, updatedDeck);
    return updatedDeck;
  }

  async deleteDeck(id: string): Promise<boolean> {
    return this.decks.delete(id);
  }

  // Tarot card operations
  async getCardsByDeck(deckId: string): Promise<TarotCard[]> {
    return Array.from(this.tarotCards.values()).filter(card => card.deckId === deckId);
  }

  async getCard(id: string): Promise<TarotCard | undefined> {
    return this.tarotCards.get(id);
  }

  async createCard(insertCard: InsertTarotCard): Promise<TarotCard> {
    const id = randomUUID();
    const card: TarotCard = {
      ...insertCard,
      id,
      number: insertCard.number ?? null,
      suit: insertCard.suit ?? null,
      imageUrl: insertCard.imageUrl ?? null,
      uprightMeaning: insertCard.uprightMeaning ?? null,
      reversedMeaning: insertCard.reversedMeaning ?? null,
      keywords: asStringArray(insertCard.keywords),
    };
    this.tarotCards.set(id, card);
    return card;
  }

  async updateCard(id: string, updateData: Partial<InsertTarotCard>): Promise<TarotCard | undefined> {
    const existingCard = this.tarotCards.get(id);
    if (!existingCard) return undefined;

    const updatedCard: TarotCard = {
      ...existingCard,
      ...updateData,
      keywords: updateData.keywords !== undefined ? asStringArray(updateData.keywords) : existingCard.keywords,
    };
    this.tarotCards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: string): Promise<boolean> {
    return this.tarotCards.delete(id);
  }

  // Reading operations
  async getRecentReadings(limit: number = 10): Promise<Reading[]> {
    return Array.from(this.readings.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createReading(insertReading: InsertReading): Promise<Reading> {
    const id = randomUUID();
    const reading: Reading = {
      ...insertReading,
      id,
      timestamp: new Date(),
      interpretation: insertReading.interpretation ?? null,
    };
    this.readings.set(id, reading);
    return reading;
  }

  async getRecentSpreadReadings(limit: number = 20): Promise<SpreadReading[]> {
    return Array.from(this.spreadReadings.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createSpreadReading(insertReading: InsertSpreadReading): Promise<SpreadReading> {
    const id = randomUUID();
    const reading: SpreadReading = {
      ...insertReading,
      id,
      timestamp: new Date(),
      operatorName: insertReading.operatorName ?? null,
      subject: insertReading.subject ?? null,
      deckId: insertReading.deckId ?? null,
      deckName: insertReading.deckName ?? null,
      cardNames: asStringArray(insertReading.cardNames) ?? [],
      reading: insertReading.reading,
    };
    this.spreadReadings.set(id, reading);
    return reading;
  }

  // Custom upload operations
  async getUploadsByDeck(deckId: string): Promise<CustomUpload[]> {
    return Array.from(this.customUploads.values()).filter(upload => upload.deckId === deckId);
  }

  async createUpload(insertUpload: InsertCustomUpload): Promise<CustomUpload> {
    const id = randomUUID();
    const upload: CustomUpload = {
      ...insertUpload,
      id,
      uploadedAt: new Date(),
    };
    this.customUploads.set(id, upload);
    return upload;
  }

  async deleteUpload(id: string): Promise<boolean> {
    return this.customUploads.delete(id);
  }
}

export const storage = new MemStorage();
