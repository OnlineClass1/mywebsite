# AI Document Genius

## Overview

AI Document Genius is a full-stack web application that allows users to upload documents (PDF, PPT, DOCX, TXT) and process them using AI for summarization, Q&A, and text humanization. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and OpenAI for AI processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 19, 2025)

✓ **Mode Selection Before Upload**: Users now select processing mode (Summary, Q&A, Humanize) before uploading documents
✓ **Enhanced Q&A Capabilities**: Improved AI to read tables, formulas, mathematical problems with step-by-step solutions
✓ **Fallback Q&A Responses**: When information isn't in document, AI provides general knowledge-based answers
✓ **Advanced Humanize Feature**: AI now detects and completely rewrites AI-generated text to be undetectable
✓ **Recent Files Management**: Added delete functionality with visual mode indicators
✓ **Gemini AI Integration**: Switched from OpenAI to Google Gemini 2.5 Flash for all AI processing
✓ **Improved UX Flow**: Start over functionality and better visual feedback throughout the process

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, Vite build tool, TailwindCSS for styling
- **Backend**: Node.js with Express, TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **AI Integration**: Google Gemini 2.5 Flash for document processing
- **UI Components**: shadcn/ui component library built on Radix UI primitives

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: TailwindCSS with CSS variables for theming (light/dark mode support)
- **Component Library**: shadcn/ui components providing consistent design system
- **File Upload**: Drag-and-drop interface with file type validation

### Backend Architecture
- **API Routes**: RESTful endpoints for file upload and AI processing
- **File Processing**: Multer for handling multipart file uploads
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **AI Service**: Centralized service for OpenAI API interactions
- **Error Handling**: Global error middleware with structured error responses

### Database Schema
- **Files Table**: Stores uploaded file metadata and extracted content
- **Processed Results Table**: Caches AI processing results (summary, Q&A, humanize)
- **Migration System**: Drizzle Kit for database schema versioning

### Security Architecture
- **API Key Protection**: All AI API keys stored server-side in environment variables
- **File Validation**: Server-side file type and size validation
- **Input Sanitization**: Zod schema validation for all API inputs

## Data Flow

1. **File Upload**: Client uploads file → Server validates and extracts text → Stores in database
2. **AI Processing**: Client requests processing → Server retrieves file content → Calls OpenAI API → Caches and returns results
3. **Result Display**: Client renders formatted AI responses with copy/download functionality

## External Dependencies

### Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **openai**: Official OpenAI API client
- **multer**: File upload handling middleware
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend (Vite) and backend (Express) servers
- **Hot Module Replacement**: Vite provides instant feedback for frontend changes
- **TypeScript Compilation**: Real-time type checking across the entire codebase

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js` with ESM output
- **Database**: `npm run db:push` applies schema changes via Drizzle

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **GEMINI_API_KEY**: Google Gemini API key for AI processing (required)
- **NODE_ENV**: Environment flag for production optimizations

### File Storage
- **Current**: Files temporarily stored in `uploads/` directory
- **Future**: Can be easily extended to cloud storage (S3, GCS, etc.)

The architecture prioritizes type safety, developer experience, and security while maintaining flexibility for future enhancements like cloud storage integration or additional AI providers.