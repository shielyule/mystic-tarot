import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertDeckSchema, insertTarotCardSchema, insertReadingSchema } from "@shared/schema";

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

  app.post("/api/decks", async (req, res) => {
    try {
      const deckData = insertDeckSchema.parse(req.body);
      const deck = await storage.createDeck(deckData);
      res.status(201).json(deck);
    } catch (error) {
      res.status(400).json({ message: "Invalid deck data" });
    }
  });

  app.put("/api/decks/:id", async (req, res) => {
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

  app.delete("/api/decks/:id", async (req, res) => {
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

  app.post("/api/cards", async (req, res) => {
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

  app.post("/api/readings", async (req, res) => {
    try {
      const readingData = insertReadingSchema.parse(req.body);
      const reading = await storage.createReading(readingData);
      res.status(201).json(reading);
    } catch (error) {
      res.status(400).json({ message: "Invalid reading data" });
    }
  });

  // File upload routes
  app.post("/api/upload/card-images", upload.array('cards', 78), async (req, res) => {
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

  app.post("/api/upload/card-back", upload.single('cardBack'), async (req, res) => {
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
