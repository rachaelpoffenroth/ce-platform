# EduFlow AI

## Overview

EduFlow AI is a comprehensive course creation and learning management platform that combines AI-powered content generation with professional accreditation compliance. The system enables instructors to create, publish, and manage courses while supporting advanced features like AI-generated content, voice cloning, automated quizzes, and Alberta Insurance Council (AIC) compliance for continuing education requirements.

The platform serves both course creators and students, offering a complete educational ecosystem with integrated payment processing, progress tracking, certificate generation, and course marketplace functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### 2024-09-11: Professional Slide Generator Upgrade
- **MAJOR UPGRADE**: Completely redesigned slide generator to match Magic Slides professional quality
- **5-Step Professional Wizard**: Content Input → Template Selection → Presentation Settings → Advanced Options → Results & Preview
- **Professional Templates**: 6 templates with visual previews (Business Professional, Modern Education, Creative Bold, etc.)
- **Magic Slides Features**: Length options (Short/Informative/Detailed/Custom), audience targeting, tone selection
- **Advanced Options**: Image integration, web research enhancement, text preservation toggles
- **Professional Editing**: Per-slide editing, duplication, deletion, and adding capabilities
- **Voice Cloning Fix**: Resolved validation errors allowing successful MP4 processing and voice clone generation

## System Architecture

### Frontend Architecture
The client is built as a React Single Page Application (SPA) using modern development patterns:
- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Feature-based organization with shared UI components, custom hooks, and utility functions

### Backend Architecture
The server follows a RESTful API design with Express.js:
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect for secure user management
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Structure**: Route-based organization with middleware for authentication, error handling, and request logging

### Database Design
PostgreSQL database with Drizzle ORM providing:
- **Schema Management**: Centralized schema definitions in shared directory
- **Type Safety**: Auto-generated TypeScript types from database schema
- **Migration System**: Drizzle Kit for database migrations and schema evolution
- **Core Entities**: Users, courses, modules, quizzes, enrollments, progress tracking, and certificates

### Course Architecture
Multi-layered course structure supporting:
- **Course Hierarchy**: Courses contain multiple modules, each with content and optional quizzes
- **Content Types**: Support for text, video, audio, and interactive content
- **Assessment System**: Module-level and final quizzes with configurable passing scores
- **Progress Tracking**: Granular progress monitoring at module and course levels
- **Accreditation**: AIC compliance features for continuing education requirements

### AI Integration
OpenAI-powered content generation system:
- **Course Generation**: AI creates comprehensive course content from prompts
- **Voice Cloning**: Audio extraction and voice synthesis for course narration
- **Quiz Generation**: Automated quiz creation based on course content
- **Content Enhancement**: AI-assisted content improvement and expansion

### Payment System
Stripe integration for monetization:
- **Payment Processing**: Secure credit card processing with Stripe Elements
- **Subscription Support**: Recurring payments and subscription management
- **Course Purchases**: Individual course purchases with enrollment automation
- **Customer Management**: Integrated customer data management

### Object Storage
Google Cloud Storage integration:
- **File Management**: Secure upload and storage of course materials
- **Access Control**: ACL-based permissions for file access
- **Media Support**: Support for video, audio, images, and documents

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Google Cloud Storage**: Object storage for course materials and media files
- **Stripe**: Payment processing and subscription management
- **OpenAI**: AI content generation and language processing

### Authentication & Security
- **Replit Auth**: OpenID Connect authentication provider
- **Session Management**: PostgreSQL-backed session storage for security

### Development & Build Tools
- **Replit Platform**: Development environment with integrated tooling
- **Vite**: Fast build tool with hot module replacement
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety across frontend and backend

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Media Processing
- **FFmpeg**: Video/audio processing for voice cloning features
- **PDFKit**: PDF generation for certificates and course materials

The architecture prioritizes developer experience with TypeScript throughout, modern React patterns, and a clear separation between client, server, and shared code. The system is designed to scale with features like AI content generation, comprehensive course management, and professional accreditation support.