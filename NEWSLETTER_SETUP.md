# Weekly Crypto Newsletter - Setup Guide

## Overview

This feature allows authenticated users to subscribe to a weekly email newsletter with the top 5 crypto news stories. The newsletter is sent every **Tuesday at 9 AM EST** and uses **source diversity** to ensure variety (1 article from each of 5 different sources).

## Key Features

✅ **RSS Feed Integration** - Replaced RapidAPI with direct RSS feed parsing (6 sources)
✅ **Email Service** - Uses Resend for reliable email delivery
✅ **Automated Scheduling** - Vercel Cron Jobs for daily news fetching and weekly newsletter sending
✅ **Source Diversity** - Selects top 1 article from each of 5 sources
✅ **Database Storage** - Stores articles for better curation and tracking
✅ **Beautiful Email Templates** - Built with React Email components
✅ **One-Click Unsubscribe** - GDPR/CAN-SPAM compliant

## News Sources (RSS Feeds)

The feature now uses direct RSS feeds from:

1. **Bitcoinist** - `https://bitcoinist.com/feed/`
2. **CoinTelegraph** - `https://cointelegraph.com/rss`
3. **Decrypt** - `https://decrypt.co/feed`
4. **BSC News** - `https://bsc.news/feed.xml`
5. **Coindesk** - `https://www.coindesk.com/arc/outboundfeeds/rss/`
6. **Cryptodaily** - `https://cryptodaily.co.uk/feed`

## Setup Instructions

### 1. Run Database Migration

First, apply the Prisma schema changes:

```bash
pnpm prisma migrate dev --name add_newsletter_feature
```

This creates three new tables:
- `NewsArticle` - Stores fetched RSS articles
- `NewsletterSubscription` - Tracks user subscriptions
- `NewsletterSend` - Logs sent newsletters

### 2. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key

### 3. Configure Domain in Resend (Production)

For production emails:

1. Go to **Domains** in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records Resend provides
4. Verify the domain
5. Update the `from` email in [src/app/api/cron/send-newsletter/route.ts:121](src/app/api/cron/send-newsletter/route.ts#L121):
   ```typescript
   from: 'Crypto Exchange Newsletter <newsletter@yourdomain.com>',
   ```

### 4. Generate Cron Secret

Generate a secure random string for cron job authentication:

```bash
openssl rand -base64 32
```

### 5. Update Environment Variables

Update your `.env.local` file:

```bash
# Resend Email API Key
RESEND_API_KEY=re_your_actual_api_key_here

# Cron Secret (paste the output from step 4)
CRON_SECRET=your_generated_secret_here

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel):
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `RESEND_API_KEY`, `CRON_SECRET`, and `NEXT_PUBLIC_APP_URL`

### 6. Deploy to Vercel

The `vercel.json` file is already configured with two cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-news",
      "schedule": "0 0 * * *"  // Daily at midnight UTC
    },
    {
      "path": "/api/cron/send-newsletter",
      "schedule": "0 14 * * 2"  // Tuesday at 2 PM UTC (9 AM EST)
    }
  ]
}
```

Push your code to deploy:

```bash
git add .
git commit -m "feat: add weekly crypto newsletter feature with RSS feeds"
git push
```

Vercel will automatically detect and schedule the cron jobs.

## Testing Locally

### Test RSS Feed Parsing

Create a test file `test-rss.ts`:

```typescript
import {fetchAllNewsFromRSS} from './src/services/rssFeedParser'

async function test() {
  const articles = await fetchAllNewsFromRSS()
  console.log(`Fetched ${articles.length} articles`)
  console.log(articles.slice(0, 5)) // Show first 5
}

test()
```

Run: `npx tsx test-rss.ts`

### Test Newsletter Subscription

1. Start your dev server: `pnpm dev`
2. Sign in to your app
3. Navigate to the News page
4. Click "Subscribe Now"
5. Check the database:
   ```bash
   pnpm prisma studio
   ```

### Test Email Template Locally

Install React Email dev tools:

```bash
pnpm add -D @react-email/render
```

Create a preview server or manually test:

```bash
# You can also create email-preview.tsx and run it
pnpm email dev
```

### Test Cron Jobs Manually

**Fetch News:**
```bash
curl http://localhost:3000/api/cron/fetch-news
```

**Send Newsletter:**
```bash
curl http://localhost:3000/api/cron/send-newsletter
```

Note: In development, cron authentication is disabled. In production, you must provide the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/send-newsletter
```

## Architecture

### Database Schema

**NewsArticle**
- Stores articles fetched from RSS feeds
- Deduplicates by URL
- Auto-deletes articles older than 30 days

**NewsletterSubscription**
- Links to User via userId
- Unique per user
- Includes unsubscribe token for one-click unsubscribe

**NewsletterSend**
- Tracks what was sent and when
- Stores article IDs and recipient count

### Workflow

1. **Daily (Midnight UTC)**: Cron job fetches latest articles from 6 RSS feeds and stores in database
2. **Weekly (Tuesday 9 AM EST)**: Cron job:
   - Queries articles from past 7 days
   - Applies source diversity algorithm (1 from each source)
   - Sends emails to all active subscribers
   - Records send in NewsletterSend table

### Selection Algorithm (Source Diversity)

The algorithm ensures variety:

1. Group articles by source
2. Select most recent article from each source
3. Stop when 5 articles are selected
4. If fewer than 5 sources have articles, fill with remaining recent articles

## API Endpoints

### `POST /api/newsletter/subscribe`
Subscribe authenticated user to newsletter

**Response:**
```json
{
  "message": "Successfully subscribed to the weekly newsletter!",
  "subscription": { ... }
}
```

### `GET /api/newsletter/subscribe`
Check subscription status

**Response:**
```json
{
  "isSubscribed": true,
  "subscription": { ... }
}
```

### `DELETE /api/newsletter/subscribe`
Unsubscribe (authenticated)

### `GET /api/newsletter/unsubscribe?token=xxx`
Unsubscribe via email link (shows HTML confirmation page)

### `GET /api/cron/fetch-news`
Manually trigger news fetch (requires auth in production)

### `GET /api/cron/send-newsletter`
Manually trigger newsletter send (requires auth in production)

## Monitoring & Debugging

### Check Cron Logs in Vercel

1. Go to your Vercel project
2. Navigate to **Logs**
3. Filter by `/api/cron/`

### Check Email Delivery in Resend

1. Go to [resend.com](https://resend.com/emails)
2. View **Emails** section
3. Check delivery status, opens, clicks

### Database Queries

```bash
pnpm prisma studio
```

Check:
- `NewsArticle` - Are articles being fetched?
- `NewsletterSubscription` - Who is subscribed?
- `NewsletterSend` - Was the newsletter sent?

## Customization

### Change Newsletter Schedule

Edit [vercel.json:9](vercel.json#L9):

```json
{
  "schedule": "0 14 * * 2"  // Format: minute hour day-of-month month day-of-week
}
```

Examples:
- Every Monday at 10 AM UTC: `"0 10 * * 1"`
- Every day at 3 PM UTC: `"0 15 * * *"`
- First of month at noon: `"0 12 1 * *"`

### Change Number of Articles

Edit [src/app/api/cron/send-newsletter/route.ts:63](src/app/api/cron/send-newsletter/route.ts#L63):

```typescript
if (selectedArticles.length === 5) {  // Change to 10 for top 10
  break
}
```

### Customize Email Template

Edit [src/emails/WeeklyNewsletter.tsx](src/emails/WeeklyNewsletter.tsx)

Use React Email components:
- Headings, Text, Images
- Buttons, Links
- Sections, Containers

### Change Selection Algorithm

Edit [src/app/api/cron/send-newsletter/route.ts:24-63](src/app/api/cron/send-newsletter/route.ts#L24-L63)

Examples:
- Most recent: Sort by `publishedAt DESC`, take first 5
- Keyword priority: Filter by keywords first
- Random selection: Shuffle and pick 5

## Migration from RapidAPI

The implementation now uses RSS feeds instead of RapidAPI. The migration is complete:

✅ RSS parser service created
✅ `getCryptoCurrencyNews` updated to use RSS
✅ News component works with new implementation
✅ Backward compatible (same data structure)

You can now:
1. Remove `NEXT_PUBLIC_RAPID_API_KEY` from environment variables
2. Delete the RapidAPI subscription (save costs!)

## Troubleshooting

### Newsletter not sending

1. Check Vercel cron logs
2. Verify `RESEND_API_KEY` is set in production
3. Check if there are active subscribers
4. Verify articles exist from past 7 days

### Emails going to spam

1. Configure SPF/DKIM in Resend (add DNS records)
2. Use verified domain (not `resend.dev`)
3. Add unsubscribe link (already included)
4. Warm up your domain (start with small batches)

### RSS feeds failing

1. Check individual feed URLs
2. Some may be temporarily down
3. Check logs in fetch-news cron
4. Parser handles failures gracefully per source

### Users can't subscribe

1. Check if they're authenticated
2. Verify Prisma migration ran
3. Check database connection
4. Look for errors in browser console

## Future Enhancements

Potential improvements:

- [ ] Newsletter preferences (frequency, topics)
- [ ] Preview newsletter before sending
- [ ] Analytics dashboard (open rates, clicks)
- [ ] A/B testing subject lines
- [ ] Personalized recommendations
- [ ] Newsletter archive page
- [ ] Social sharing buttons in emails
- [ ] "Send test email" admin feature

## Support

For issues or questions:
- Check Vercel logs
- Review Resend dashboard
- Inspect Prisma Studio
- Review this documentation

## License

Same as the main project.
