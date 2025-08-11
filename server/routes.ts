import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { insertDeckSchema, insertTarotCardSchema, insertReadingSchema } from "@shared/schema";

// Helper function to parse card information from filename
function parseCardFromFilename(filename: string) {
  // Remove file extension and clean the filename
  const cleanName = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase().trim();
  
  // Handle card back
  if (cleanName.includes('cardback') || cleanName.includes('card_back') || cleanName.includes('back')) {
    return { isCardBack: true };
  }

  // Major Arcana mapping - handle various naming conventions
  const majorArcana = {
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
