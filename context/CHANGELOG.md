# Changelog

All notable changes to the CryptoCurrent Exchange App will be documented in this
file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Playwright E2E testing setup with comprehensive test suite
- CLAUDE.local.md file for AI assistant context
- CHANGELOG.md for tracking implementations
- plan.md for project planning and roadmap
- **UI Improvement Workflow** - Agentic screenshot-based UI analysis system
- Visual regression testing with automated screenshot capture
- UI analysis script for accessibility and performance evaluation
- Comprehensive test coverage for homepage, navigation, themes, and locales

### Changed

- Updated Providers component with better type safety for messages prop
- Renamed AIchatbot component to AIChatbot for consistency
- Enhanced image performance with lazy loading and proper alt attributes
- **Improved text contrast ratios across the application**
  - Hero component description: `text-gray-600` → `text-gray-800`
  - News components: Multiple gray text colors darkened for WCAG AA compliance
  - Chart descriptions: Enhanced contrast for better readability
  - Footer social icons: Improved hover state contrast

### Fixed

- Type safety improvements in Providers component
- Image optimization and accessibility improvements
- **Accessibility contrast issues** - Fixed 8 text elements with low contrast
  ratios
- **WCAG AA Compliance** - Text contrast ratios now meet or approach 4.5:1
  standard

## [0.1.0] - 2024-12-23

### Initial Release

#### Core Features

- **Cryptocurrency Exchange Calculator**
  - Real-time exchange rate calculations
  - Support for multiple cryptocurrencies
  - Integration with exchange rate APIs

- **News Aggregation System**
  - Crypto news from multiple sources (CoinDesk, Cointelegraph, Decrypt, etc.)
  - News filtering and selection
  - Skeleton loading states for better UX

- **Authentication System**
  - Email/password authentication with NextAuth v5
  - OAuth support (GitHub, Google)
  - Role-based access control (USER/ADMIN)
  - Protected routes and sessions

- **Web3 Integration**
  - Wallet connection support via wagmi
  - Blockchain interactions with viem
  - ConnectWalletButton component

- **Payment Processing**
  - Stripe integration for donations
  - Success page with confirmation
  - Crypto donation support

- **Charts & Analytics**
  - Cryptocurrency price charts
  - Statistical data visualization
  - Single and multi-chart views
  - Integration with Recharts

- **AI Chatbot**
  - n8n chat integration
  - AI assistant for user support
  - Context-aware responses

- **Internationalization**
  - Multi-language support (English, Spanish)
  - Locale switching component
  - Localized routing with next-intl

#### Technical Stack

- Next.js 15.1.2 with App Router
- React 19.0.0
- TypeScript 5
- Tailwind CSS 3.4.1
- HeroUI component library
- Prisma ORM with PostgreSQL
- TanStack Query v5
- React Hook Form with Zod validation
- Framer Motion for animations

#### Infrastructure

- Turbopack for development
- ESLint and Prettier for code quality
- pnpm package manager
- Supabase for database hosting

### Database Schema

- User model with authentication
- Account model for OAuth providers
- Session management
- Verification tokens

### Development Setup

- Environment configuration
- Database migrations
- Development scripts
- Testing infrastructure
