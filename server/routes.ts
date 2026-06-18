import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertDeckSchema, insertTarotCardSchema, insertReadingSchema } from "@shared/schema";
import { z } from "zod";
import { generateTarotReadingWithGemini, type TarotReadingCardPayload } from "./tarot-ai-reading";
import { isFishAudioConfigured, synthesizeHalSpeech } from "./fish-audio-tts";
import { registerAuthRoutes, requireAuth } from "./auth";
import {
  createSpreadReadingForUser,
  getSpreadReadingsByUser,
} from "./spread-reading-repository";

// Helper function to parse card information from filename
function parseCardFromFilename(filename: string) {
  // Remove file extension and clean the filename
  const cleanName = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase().trim();
  
  // Handle card back
  if (cleanName.includes('cardback') || cleanName.includes('card_back') || cleanName.includes('back')) {
    return { isCardBack: true };
  }

  // Major Arcana mapping - handle various naming conventions
  const majorArcana: Record<string, { name: string; number: number }> = {
    'fool': { name: 'The Fool', number: 0 },
    'the_fool': { name: 'The Fool', number: 0 },
    'magician': { name: 'The Magician', number: 1 },
    'the_magician': { name: 'The Magician', number: 1 },
    'high_priestess': { name: 'The High Priestess', number: 2 },
    'the_high_priestess': { name: 'The High Priestess', number: 2 },
    'empress': { name: 'The Empress', number: 3 },
    'the_empress': { name: 'The Empress', number: 3 },
    'emperor': { name: 'The Emperor', number: 4 },
    'the_emperor': { name: 'The Emperor', number: 4 },
    'hierophant': { name: 'The Hierophant', number: 5 },
    'the_hierophant': { name: 'The Hierophant', number: 5 },
    'lovers': { name: 'The Lovers', number: 6 },
    'the_lovers': { name: 'The Lovers', number: 6 },
    'chariot': { name: 'The Chariot', number: 7 },
    'the_chariot': { name: 'The Chariot', number: 7 },
    'strength': { name: 'Strength', number: 8 },
    'hermit': { name: 'The Hermit', number: 9 },
    'the_hermit': { name: 'The Hermit', number: 9 },
    'wheel_of_fortune': { name: 'Wheel of Fortune', number: 10 },
    'wheel': { name: 'Wheel of Fortune', number: 10 },
    'justice': { name: 'Justice', number: 11 },
    'hanged_man': { name: 'The Hanged Man', number: 12 },
    'the_hanged_man': { name: 'The Hanged Man', number: 12 },
    'death': { name: 'Death', number: 13 },
    'temperance': { name: 'Temperance', number: 14 },
    'devil': { name: 'The Devil', number: 15 },
    'the_devil': { name: 'The Devil', number: 15 },
    'tower': { name: 'The Tower', number: 16 },
    'the_tower': { name: 'The Tower', number: 16 },
    'star': { name: 'The Star', number: 17 },
    'the_star': { name: 'The Star', number: 17 },
    'moon': { name: 'The Moon', number: 18 },
    'the_moon': { name: 'The Moon', number: 18 },
    'sun': { name: 'The Sun', number: 19 },
    'the_sun': { name: 'The Sun', number: 19 },
    'judgement': { name: 'Judgement', number: 20 },
    'judgment': { name: 'Judgement', number: 20 },
    'world': { name: 'The World', number: 21 },
    'the_world': { name: 'The World', number: 21 }
  };

  const normalized = cleanName.replace(/[-\s]/g, '_');

  // Check if it's a Major Arcana card
  if (majorArcana[normalized]) {
    return {
      name: majorArcana[normalized].name,
      arcana: 'major',
      suit: null,
      number: majorArcana[normalized].number,
      isCardBack: false
    };
  }

  // Parse Minor Arcana - handle format like "01_cups", "ace_wands", "king_swords"
  const minorPattern = /^(ace|0?[1-9]|10|page|knight|queen|king)[_\-]?(wands|cups|swords|pentacles)$/;
  const minorMatch = normalized.match(minorPattern);
  
  if (minorMatch) {
    const [, rank, suit] = minorMatch;
    
    const rankNumbers: Record<string, number> = {
      'ace': 1, '01': 1, '1': 1, '02': 2, '2': 2, '03': 3, '3': 3,
      '04': 4, '4': 4, '05': 5, '5': 5, '06': 6, '6': 6,
      '07': 7, '7': 7, '08': 8, '8': 8, '09': 9, '9': 9, '10': 10,
      'page': 11, 'knight': 12, 'queen': 13, 'king': 14
    };

    const rankNames: Record<string, string> = {
      'ace': 'Ace', '01': 'Ace', '1': 'Ace', '02': 'Two', '2': 'Two',
      '03': 'Three', '3': 'Three', '04': 'Four', '4': 'Four',
      '05': 'Five', '5': 'Five', '06': 'Six', '6': 'Six',
      '07': 'Seven', '7': 'Seven', '08': 'Eight', '8': 'Eight',
      '09': 'Nine', '9': 'Nine', '10': 'Ten',
      'page': 'Page', 'knight': 'Knight', 'queen': 'Queen', 'king': 'King'
    };

    return {
      name: `${rankNames[rank]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      arcana: 'minor',
      suit: suit,
      number: rankNumbers[rank],
      isCardBack: false
    };
  }

  // If no pattern matches, try to determine if it's a suit card by checking the filename
  const suits = ['wands', 'cups', 'swords', 'pentacles'];
  for (const suit of suits) {
    if (normalized.includes(suit)) {
      // Try to extract number or rank
      const numMatch = normalized.match(/(\d{1,2})/);
      if (numMatch) {
        const num = parseInt(numMatch[1]);
        if (num >= 1 && num <= 14) {
          const rankNames = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
          return {
            name: `${rankNames[num]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
            arcana: 'minor',
            suit: suit,
            number: num,
            isCardBack: false
          };
        }
      }
    }
  }

  // Default fallback - assume it's a major arcana with a generic name
  return {
    name: cleanName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    arcana: 'major',
    suit: null,
    number: null,
    isCardBack: false
  };
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  registerAuthRoutes(app);

  // Deck routes
  app.get("/api/decks", async (req, res) => {
    try {
      const decks = await storage.getDecks();
      res.json(decks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch decks" });
    }
  });

  app.get("/api/decks/:id", async (req, res) => {
    try {
      const deck = await storage.getDeck(req.params.id);
      if (!deck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      res.json(deck);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deck" });
    }
  });

  app.post("/api/decks", requireAuth, async (req, res) => {
    try {
      const deckData = insertDeckSchema.parse(req.body);
      const deck = await storage.createDeck(deckData);
      res.status(201).json(deck);
    } catch (error) {
      res.status(400).json({ message: "Invalid deck data" });
    }
  });

  app.put("/api/decks/:id", requireAuth, async (req, res) => {
    try {
      const deckData = insertDeckSchema.partial().parse(req.body);
      const deck = await storage.updateDeck(req.params.id, deckData);
      if (!deck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      res.json(deck);
    } catch (error) {
      res.status(400).json({ message: "Invalid deck data" });
    }
  });

  app.delete("/api/decks/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteDeck(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Deck not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deck" });
    }
  });

  // Tarot card routes
  app.get("/api/decks/:deckId/cards", async (req, res) => {
    try {
      const cards = await storage.getCardsByDeck(req.params.deckId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.get("/api/cards/:id", async (req, res) => {
    try {
      const card = await storage.getCard(req.params.id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch card" });
    }
  });

  app.post("/api/cards", requireAuth, async (req, res) => {
    try {
      const cardData = insertTarotCardSchema.parse(req.body);
      const card = await storage.createCard(cardData);
      res.status(201).json(card);
    } catch (error) {
      res.status(400).json({ message: "Invalid card data" });
    }
  });

  // Random card selection
  app.get("/api/decks/:deckId/random-card", async (req, res) => {
    try {
      const cards = await storage.getCardsByDeck(req.params.deckId);
      if (cards.length === 0) {
        return res.status(404).json({ message: "No cards found in deck" });
      }
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      res.json(randomCard);
    } catch (error) {
      res.status(500).json({ message: "Failed to draw random card" });
    }
  });

  // Reading routes
  app.get("/api/readings", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const readings = await storage.getRecentReadings(limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch readings" });
    }
  });

  app.post("/api/readings", requireAuth, async (req, res) => {
    try {
      const readingData = insertReadingSchema.parse(req.body);
      const reading = await storage.createReading(readingData);
      res.status(201).json(reading);
    } catch (error) {
      res.status(400).json({ message: "Invalid reading data" });
    }
  });

  app.get("/api/spread-readings", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const readings = await getSpreadReadingsByUser(req.user!.id, limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spread readings" });
    }
  });

  const tarotReadingRequestSchema = z.object({
    operatorName: z.string().max(200).optional(),
    subject: z.string().max(4000).optional(),
    deckId: z.string().max(64).optional(),
    deckName: z.string().max(200).optional(),
    cards: z
      .array(
        z.object({
          name: z.string().min(1).max(200),
          arcana: z.string().min(1).max(32),
          suit: z.string().max(32).nullable().optional(),
          number: z.number().int().nullable().optional(),
          uprightMeaning: z.string().max(8000).nullable().optional(),
          keywords: z.array(z.string().max(100)).max(40).optional(),
        }),
      )
      .length(3),
  });

  const ttsSpeechRequestSchema = z.object({
    text: z.string().min(1).max(12_000),
  });

  app.get("/api/tts/status", (_req, res) => {
    res.json({
      configured: isFishAudioConfigured(),
      voiceId: process.env.FISH_HAL_VOICE_ID?.trim() || "3892b24d0b11449a8d60eae269d7ee73",
    });
  });

  app.post("/api/tts/speech", async (req, res) => {
    try {
      const body = ttsSpeechRequestSchema.parse(req.body);
      const audio = await synthesizeHalSpeech({ text: body.text });
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "no-store");
      res.send(audio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request body", issues: error.issues });
      }
      const msg = error instanceof Error ? error.message : "Failed to synthesize speech";
      if (msg.includes("FISH_API_KEY")) {
        return res.status(503).json({
          message:
            "HAL speech is not configured. Set FISH_API_KEY (and optionally FISH_HAL_VOICE_ID) in the server environment.",
        });
      }
      if (msg.includes("402") || msg.includes("no API credits")) {
        return res.status(402).json({ message: msg });
      }
      console.error("POST /api/tts/speech:", error);
      res.status(500).json({ message: msg.length > 400 ? `${msg.slice(0, 400)}…` : msg });
    }
  });

  app.post("/api/tarot-reading", async (req, res) => {
    try {
      const body = tarotReadingRequestSchema.parse(req.body);
      const reading = await generateTarotReadingWithGemini(
        body.operatorName,
        body.subject,
        body.cards as TarotReadingCardPayload[],
      );
      let savedId: string | undefined;
      if (req.isAuthenticated() && req.user) {
        try {
          const saved = await createSpreadReadingForUser(req.user.id, {
            operatorName: body.operatorName ?? null,
            subject: body.subject ?? null,
            deckId: body.deckId ?? null,
            deckName: body.deckName ?? null,
            cardNames: body.cards.map((c) => c.name),
            reading,
          });
          savedId = saved.id;
        } catch (saveErr) {
          console.error("Failed to save spread reading:", saveErr);
        }
      }
      res.json({ reading, id: savedId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request body", issues: error.issues });
      }
      const msg = error instanceof Error ? error.message : "Failed to generate reading";
      if (msg.includes("GEMINI_API_KEY")) {
        return res.status(503).json({
          message:
            "AI reading is not configured. Set GEMINI_API_KEY (and optionally GEMINI_MODEL, e.g. gemini-2.5-flash) in the server environment.",
        });
      }
      console.error("POST /api/tarot-reading:", error);
      res.status(500).json({ message: msg.length > 400 ? `${msg.slice(0, 400)}…` : msg });
    }
  });

  // File upload routes
  app.post("/api/upload/card-images", requireAuth, upload.array('cards', 78), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { deckId, cardType } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadResults = [];
      for (const file of files) {
        const uploadData = {
          deckId,
          filename: file.filename,
          originalName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          cardType: cardType || 'major_arcana',
        };
        
        const upload = await storage.createUpload(uploadData);
        uploadResults.push(upload);
      }

      res.status(201).json(uploadResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Bulk upload route for complete deck
  app.post("/api/upload/bulk-deck", requireAuth, upload.array('cards', 78), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { deckId } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadResults = [];
      const createdCards = [];
      
      for (const file of files) {
        // Extract card name from filename (remove .png/.jpg extension)
        const cardName = file.originalname.replace(/\.(png|jpg|jpeg|webp)$/i, '');
        
        // Create upload record
        const uploadData = {
          deckId,
          filename: file.filename,
          originalName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          cardType: 'bulk_upload',
        };
        const upload = await storage.createUpload(uploadData);
        uploadResults.push(upload);

        // Create card record based on filename
        const cardData = parseCardFromFilename(cardName);
        if (cardData && !cardData.isCardBack && cardData.name) {
          const card = await storage.createCard({
            deckId,
            name: cardData.name,
            arcana: cardData.arcana as 'major' | 'minor',
            suit: cardData.suit,
            number: cardData.number,
            imageUrl: upload.fileUrl,
            uprightMeaning: null,
            reversedMeaning: null,
            keywords: null,
          });
          createdCards.push(card);
        }
      }

      res.status(201).json({ 
        uploads: uploadResults, 
        cards: createdCards,
        message: `Successfully uploaded ${files.length} cards` 
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ message: "Failed to upload deck files" });
    }
  });

  app.post("/api/upload/card-back", requireAuth, upload.single('cardBack'), async (req, res) => {
    try {
      const file = req.file;
      const { deckId } = req.body;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadData = {
        deckId,
        filename: file.filename,
        originalName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        cardType: 'card_back',
      };

      const upload = await storage.createUpload(uploadData);
      
      // Update deck with card back URL
      await storage.updateDeck(deckId, { 
        cardBackImageUrl: upload.fileUrl 
      });

      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload card back" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
