# CORS Issue Fix - RSS Feeds

## Problem

When fetching RSS feeds directly from the client-side (browser), you'll encounter CORS errors like:

```
Access to fetch at 'https://cryptodaily.co.uk/feed' from origin 'http://localhost:3000'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

This happens because:
1. RSS feeds are designed for server-side consumption
2. They don't include CORS headers (`Access-Control-Allow-Origin`)
3. Browsers block cross-origin requests without these headers

## Solution

We've implemented a **server-side API proxy** to fetch RSS feeds:

### Architecture

```
Client (Browser)
    ↓ fetch('/api/news?source=bitcoinist')
API Route (Server)
    ↓ fetchNewsBySource('bitcoinist')
RSS Parser (Server)
    ↓ fetch RSS feed (no CORS restrictions!)
RSS Feed Server
```

### Implementation

1. **Created API Route**: [src/app/api/news/route.ts](src/app/api/news/route.ts)
   - Server-side endpoint that proxies RSS feed requests
   - No CORS issues because it runs on the server
   - Includes 5-minute caching to reduce RSS feed requests

2. **Updated Service**: [src/services/cryptoCurrencyNews.ts](src/services/cryptoCurrencyNews.ts)
   - Client-side code now calls `/api/news` instead of fetching RSS directly
   - Maintains backward compatibility with existing schema

### Key Benefits

✅ **No CORS Errors**: Server-side fetching bypasses browser CORS restrictions
✅ **Caching**: 5-minute cache reduces load on RSS feed servers
✅ **Performance**: Cache headers enable CDN caching
✅ **Reliability**: Better error handling and logging
✅ **Security**: API keys and server logic hidden from client

### How to Use

The News component works exactly the same - no changes needed:

```typescript
// This still works, but now uses the API route internally
const {data} = useQuery({
  queryKey: ['cryptoNews', {source: 'bitcoinist'}],
  queryFn: async () => getCryptoCurrencyNews('bitcoinist'),
})
```

### Cache Configuration

- **Client Cache**: 5 minutes (via Next.js revalidate)
- **CDN Cache**: 5 minutes (via Cache-Control header)
- **Stale-While-Revalidate**: 10 minutes (serves stale content while fetching fresh)

To adjust caching, edit [src/app/api/news/route.ts:5](src/app/api/news/route.ts#L5):

```typescript
export const revalidate = 300 // Change to desired seconds
```

### Testing

Test the API route directly:

```bash
curl http://localhost:3000/api/news?source=bitcoinist
```

Expected response:
```json
[
  {
    "url": "https://...",
    "title": "Bitcoin Reaches New High",
    "description": "...",
    "thumbnail": "https://...",
    "createdAt": "2025-12-21T..."
  },
  ...
]
```

### Available Sources

Query parameter values (from `searchParams` in static config):
- `bitcoinist`
- `cointelegraph`
- `decrypt`
- `bsc`
- `coindesk`
- `cryptodaily`

Example:
```
/api/news?source=cointelegraph
```

## Important Notes

1. **Server-Side Only in Cron Jobs**: The cron jobs (`/api/cron/fetch-news` and `/api/cron/send-newsletter`) call `rssFeedParser` directly since they're already server-side.

2. **Client-Side Uses API Route**: The News component (client-side) uses the `/api/news` route to avoid CORS.

3. **No Changes to UI**: The News component works exactly as before - the CORS fix is transparent.

## Troubleshooting

### Still seeing CORS errors?

1. Make sure you're using the updated code
2. Clear browser cache: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Restart dev server: `pnpm dev`
4. Check that `/api/news` route exists

### API route returning errors?

1. Check server logs in terminal
2. Verify RSS feed URLs in [src/static/index.tsx](src/static/index.tsx)
3. Test individual RSS feeds directly in browser
4. Some feeds may be temporarily down (parser handles this gracefully)

### Performance issues?

1. Increase cache time in route.ts
2. Consider using database storage (already implemented in cron jobs)
3. Implement React Query caching (already configured)

## Summary

The CORS issue is completely resolved by:
- Moving RSS fetching to server-side API route
- Keeping client-side code simple and CORS-free
- Adding intelligent caching for performance
- Maintaining backward compatibility

Your News component now works smoothly without any CORS errors! 🎉
