# Mystic Tarot 🔮

A mystical digital tarot card reading application built with React, TypeScript, and Express. Features an enchanting dark interface with gold accents, card flipping animations, and a complete content management system for creating custom tarot decks.

## ✨ Features

- **Interactive Tarot Readings**: Draw cards for personalized mystical readings
- **Complete 78-Card Support**: Full support for Major Arcana (22 cards) and Minor Arcana (56 cards across 4 suits)
- **Multiple Decks**: Browse and select from different tarot deck themes
- **Card Flipping Animations**: Smooth, mystical animations using Framer Motion
- **Custom Deck Creation**: Full CMS for uploading and managing custom tarot card graphics
- **Bulk Upload System**: Intelligent filename parsing for uploading entire deck collections at once
- **Responsive Design**: Beautiful dark theme with gold accents and mystical aesthetics
- **Reading History**: Track your past readings and interpretations

## 🎨 Design

The application features a mystical dark theme with:
- Deep purple and navy backgrounds with animated gradient overlays
- Gold accents (#D4AF37) for mystical elegance
- Custom fonts: Cinzel for headings, Inter for body text, Crimson Text for readings
- Animated glow effects and mystical background patterns
- Smooth card flip animations and hover effects

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** (React Query) for server state management
- **Framer Motion** for animations
- **Shadcn/UI** components with Radix UI primitives
- **Tailwind CSS** for styling
- **Vite** for blazing-fast development

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database (Neon serverless)
- **Drizzle ORM** for type-safe database queries
- **Multer** for file upload handling
- **Session management** with connect-pg-simple

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/shielyule/mystic-tarot.git
cd mystic-tarot
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
- Create a PostgreSQL database
- Configure your database connection in `.env`

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🗂️ Project Structure

```
mystic-tarot/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (Home, Decks, Upload, CMS)
│   │   ├── lib/         # Utilities and configuration
│   │   └── App.tsx      # Main application component
├── server/              # Backend Express server
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database abstraction layer
│   └── github.ts        # GitHub integration utilities
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema and Zod validators
└── uploads/             # User-uploaded card images
```

## 🎴 Using the Bulk Upload Feature

The application includes an intelligent bulk upload system designed for complete tarot deck collections:

1. Navigate to the **Upload** tab
2. Enter a name for your deck
3. Select all your card image files at once (supports PNG, JPEG, WebP)
4. The system automatically recognizes and categorizes cards based on filenames

### Supported Filename Formats

**Major Arcana**:
- `the_fool.png`, `fool.png`
- `the_magician.png`, `magician.png`
- etc. (all 22 Major Arcana cards)

**Minor Arcana**:
- Numbered cards: `ace_cups.png`, `02_wands.png`, `10_swords.png`
- Court cards: `page_pentacles.png`, `knight_cups.png`, `queen_wands.png`, `king_swords.png`

**Card Backs**:
- `cardback.png`, `card_back.png`, `back.png`

## 🔮 API Endpoints

- `GET /api/decks` - Get all tarot decks
- `GET /api/decks/:id` - Get a specific deck
- `POST /api/decks` - Create a new deck
- `GET /api/decks/:id/cards` - Get all cards in a deck
- `POST /api/cards` - Create a new card
- `POST /api/readings` - Create a new reading
- `GET /api/readings` - Get all readings
- `POST /api/upload/bulk-deck` - Bulk upload deck images

## 🎯 Features in Detail

### Card Reading System
- Draw cards from any deck
- View card meanings (upright and reversed)
- Save reading history with timestamps
- View recent readings on the home page

### Content Management System
- Create custom decks with metadata
- Upload individual cards or entire decks
- Automatic card categorization
- Manage deck themes and descriptions

### Deck Management
- Browse all available decks
- View deck details and card counts
- Filter by theme or custom status
- Preview deck card backs

## 🚀 Deployment

This application is optimized for deployment on Replit but can be deployed to any Node.js hosting platform:

1. Set up your environment variables
2. Build the frontend: `npm run build`
3. Start the production server: `npm start`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## ✨ Acknowledgments

- Tarot card imagery and meanings based on traditional Rider-Waite-Smith deck
- Built with modern web technologies and best practices
- Designed for mystical enthusiasts and tarot practitioners

---

*May the cards guide your path* 🌙✨
