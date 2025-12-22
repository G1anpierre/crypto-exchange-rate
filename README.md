# Crypto Exchange Rate

![Crypto Exchange Rate](https://github.com/G1anpierre/crypto-exchange-rate/raw/main/public/crypto-preview.png)

A modern web application for live cryptocurrency exchange rate tracking, crypto news aggregation, and weekly newsletter subscription, built with Next.js.

## Features

- Real-time cryptocurrency price tracking
- Currency conversion calculator
- **Crypto news from 6 major sources** (via RSS feeds)
- **Weekly newsletter subscription** - Get top 5 crypto news every Tuesday
- Responsive design for all devices
- Interactive charts for price history
- Dark/light mode toggle
- Search functionality for finding specific cryptocurrencies
- User authentication and profiles

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Data Source**: Direct RSS feeds from crypto news sources
- **Email**: Resend with React Email templates
- **Deployment**: Vercel with Cron Jobs
- **Authentication**: NextAuth.js v5
- **State Management**: TanStack Query

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher (23.x recommended for local development)
  - Check your version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
- **pnpm**: Version 9.x or higher
  - Install: `npm install -g pnpm`
- **PostgreSQL**: For database (or use a cloud provider like Neon)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
STORAGE_DATABASE_URL=your_postgresql_connection_string

# Authentication
AUTH_SECRET=your_auth_secret
AUTH_GITHUB_ID=your_github_oauth_id
AUTH_GITHUB_SECRET=your_github_oauth_secret
AUTH_GOOGLE_ID=your_google_oauth_id
AUTH_GOOGLE_SECRET=your_google_oauth_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Cron Jobs
CRON_SECRET=your_cron_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [NEWSLETTER_SETUP.md](./NEWSLETTER_SETUP.md) for detailed setup instructions.

## Project Structure

The project follows a clean architecture pattern:

- `/app` - Next.js app router components and pages
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and API client
- `/public` - Static assets

## Contributions

Contributions, issues, and feature requests are welcome!

## License

[MIT](LICENSE)