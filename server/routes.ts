import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertDeckSchema, insertTarotCardSchema, insertReadingSchema } from "@shared/schema";

// Helper function to parse card information from filename
function parseCardFromFilename(filename: string) {
  // Major Arcana mapping
  const majorArcana = {
    'the fool': { name: 'The Fool', number: 0 },
    'the magician': { name: 'The Magician', number: 1 },
    'the high priestess': { name: 'The High Priestess', number: 2 },
    'the empress': { name: 'The Empress', number: 3 },
    'the emperor': { name: 'The Emperor', number: 4 },
    'the hierophant': { name: 'The Hierophant', number: 5 },
    'the lovers': { name: 'The Lovers', number: 6 },
    'the chariot': { name: 'The Chariot', number: 7 },
    'strength': { name: 'Strength', number: 8 },
    'the hermit': { name: 'The Hermit', number: 9 },
    'wheel of fortune': { name: 'Wheel of Fortune', number: 10 },
    'justice': { name: 'Justice', number: 11 },
    'the hanged man': { name: 'The Hanged Man', number: 12 },
    'death': { name: 'Death', number: 13 },
    'temperance': { name: 'Temperance', number: 14 },
    'the devil': { name: 'The Devil', number: 15 },
    'the tower': { name: 'The Tower', number: 16 },
    'the star': { name: 'The Star', number: 17 },
    'the moon': { name: 'The Moon', number: 18 },
    'the sun': { name: 'The Sun', number: 19 },
    'judgement': { name: 'Judgement', number: 20 },
    'the world': { name: 'The World', number: 21 }
  };

  const normalized = filename.toLowerCase().replace(/[-_]/g, ' ').trim();

  // Check if it's a Major Arcana card
  if (majorArcana[normalized]) {
    return {
      name: majorArcana[normalized].name,
      arcana: 'major',
      suit: null,
      number: majorArcana[normalized].number
    };
  }

  // Parse Minor Arcana (e.g., "ace of wands", "two of cups", "king of swords")
  const minorPattern = /^(ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)\s+of\s+(wands|cups|swords|pentacles)$/;
  const minorMatch = normalized.match(minorPattern);
  
  if (minorMatch) {
    const [, rank, suit] = minorMatch;
    const rankNumbers: Record<string, number> = {
      'ace': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'page': 11, 'knight': 12, 'queen': 13, 'king': 14
    };

    return {
      name: `${rank.charAt(0).toUpperCase() + rank.slice(1)} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      arcana: 'minor',
      suit: suit,
      number: rankNumbers[rank]
    };
  }

  // If no pattern matches, return a generic card
  return {
    name: filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    arcana: 'major', // default to major
    suit: null,
    number: null
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

  // Bulk upload route for complete deck
  app.post("/api/upload/bulk-deck", upload.array('cards', 78), async (req, res) => {
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
        if (cardData) {
          const card = await storage.createCard({
            deckId,
            name: cardData.name,
            arcana: cardData.arcana,
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
