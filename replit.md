# Overview

Mystic Tarot is a digital tarot card reading application that provides users with mystical card experiences. The application allows users to draw cards for personalized readings, browse different tarot decks, and create custom decks through a content management system. Built with a modern full-stack architecture, it features a React frontend with mystical theming and an Express.js backend with PostgreSQL data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React using TypeScript and follows a component-based architecture. The UI leverages Shadcn/UI components with Radix UI primitives for accessibility and consistent design patterns. Styling is handled through Tailwind CSS with a custom mystical theme featuring dark colors, gold accents, and specialized fonts (Cinzel for headings, Inter for body text, Crimson Text for reading content).

Key frontend architectural decisions:
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Animation**: Framer Motion for card flipping animations and mystical effects
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **File Structure**: Organized by feature with shared components in `/components/ui/`

## Backend Architecture
The server follows a REST API architecture built with Express.js and TypeScript. The application uses a layered approach with clear separation of concerns between routing, business logic, and data access.

Key backend architectural decisions:
- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM for PostgreSQL with type-safe queries
- **Storage Abstraction**: Interface-based storage layer allowing for different implementations (currently in-memory for development)
- **File Uploads**: Multer middleware for handling image uploads with validation
- **Development**: Vite integration for hot reload during development

## Database Schema
PostgreSQL database with the following core entities:
- **Decks**: Container for tarot card collections with themes and customization
- **Tarot Cards**: Individual cards with arcana type, meanings, and imagery
- **Readings**: Historical record of card draws and interpretations
- **Custom Uploads**: User-uploaded images for custom deck creation

The schema uses UUID primary keys and proper foreign key relationships to maintain data integrity.

## Content Management System
Built-in CMS allows users to create custom tarot decks by:
- Defining deck metadata (name, description, theme)
- Uploading custom card images with type categorization
- Managing major and minor arcana cards separately
- Tracking upload progress for different card types

## Authentication & Sessions
Currently implements a basic session-based approach using connect-pg-simple for PostgreSQL session storage, though full authentication features are not yet implemented in the codebase.

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework with hooks and modern patterns
- **Express.js**: Node.js web server framework
- **TypeScript**: Type safety across both frontend and backend
- **Vite**: Build tool and development server with hot reload

## Database & ORM
- **PostgreSQL**: Primary database through Neon serverless
- **Drizzle ORM**: Type-safe database queries and migrations
- **Drizzle Kit**: Database migration and schema management tools

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI primitives for accessibility
- **Shadcn/UI**: Pre-built component library built on Radix
- **Framer Motion**: Animation library for card interactions
- **Lucide React**: Icon library for consistent iconography

## State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation for forms and API data

## File Upload & Processing
- **Multer**: Express middleware for multipart/form-data handling
- **Image validation**: JPEG, PNG, WebP support with 5MB size limits

## Development Tools
- **TSX**: TypeScript execution for development server
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **Replit Integration**: Development environment optimizations