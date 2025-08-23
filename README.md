# Crypto Exchange Rate

![Crypto Exchange Rate](https://github.com/G1anpierre/crypto-exchange-rate/raw/main/public/crypto-preview.png)

A modern web application for live cryptocurrency exchange rate tracking, built with Next.js and RapidAPI.

## Features

- Real-time cryptocurrency price tracking
- Currency conversion calculator
- Responsive design for all devices
- Interactive charts for price history
- Dark/light mode toggle
- Search functionality for finding specific cryptocurrencies

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: Tailwind CSS
- **Data Source**: RapidAPI cryptocurrency endpoints
- **Deployment**: Vercel
- **Authentication**: NextAuth.js
- **State Management**: React Context API

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

```
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=your_rapidapi_host
```

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