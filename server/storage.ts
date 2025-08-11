import { 
  type Deck, 
  type InsertDeck, 
  type TarotCard, 
  type InsertTarotCard, 
  type Reading, 
  type InsertReading,
  type CustomUpload,
  type InsertCustomUpload 
} from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Custom upload operations
  getUploadsByDeck(deckId: string): Promise<CustomUpload[]>;
  createUpload(upload: InsertCustomUpload): Promise<CustomUpload>;
  deleteUpload(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private decks: Map<string, Deck>;
  private tarotCards: Map<string, TarotCard>;
  private readings: Map<string, Reading>;
  private customUploads: Map<string, CustomUpload>;

  constructor() {
    this.decks = new Map();
    this.tarotCards = new Map();
    this.readings = new Map();
    this.customUploads = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default Rider-Waite deck
    const defaultDeckId = randomUUID();
    const defaultDeck: Deck = {
      id: defaultDeckId,
      name: "Rider-Waite Classic",
      description: "The traditional and most widely recognized tarot deck with rich symbolism and detailed artwork.",
      theme: "classic",
      cardBackImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
      isCustom: false,
      createdAt: new Date(),
    };
    this.decks.set(defaultDeckId, defaultDeck);

    // Add sample major arcana cards
    const majorArcanaCards = [
      {
        name: "The Fool",
        number: 0,
        uprightMeaning: "New beginnings, innocence, spontaneity, and a free spirit. The Fool represents the start of a journey and the courage to step into the unknown.",
        keywords: ["New beginnings", "Innocence", "Adventure", "Trust"],
        imageUrl: "https://images.unsplash.com/photo-1551029506-0807df4e2031?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        name: "The Magician",
        number: 1,
        uprightMeaning: "Manifestation, resourcefulness, power, and inspired action. The Magician represents the ability to turn dreams into reality.",
        keywords: ["Manifestation", "Power", "Skill", "Concentration"],
        imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      },
      {
        name: "The High Priestess",
        number: 2,
        uprightMeaning: "Intuition, sacred knowledge, divine feminine, and the subconscious mind. She represents inner wisdom and mysteries.",
        keywords: ["Intuition", "Mystery", "Subconscious", "Wisdom"],
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
      }
    ];

    majorArcanaCards.forEach(cardData => {
      const cardId = randomUUID();
      const card: TarotCard = {
        id: cardId,
        deckId: defaultDeckId,
        name: cardData.name,
        arcana: "major",
        suit: null,
        number: cardData.number,
        imageUrl: cardData.imageUrl,
        uprightMeaning: cardData.uprightMeaning,
        reversedMeaning: null,
        keywords: cardData.keywords.length > 0 ? cardData.keywords : null,
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
      keywords: insertCard.keywords && Array.isArray(insertCard.keywords) ? insertCard.keywords : null,
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
