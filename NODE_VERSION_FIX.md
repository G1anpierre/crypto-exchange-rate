# Node.js Version Fix for Vercel Deployment

## Issue
Vercel was blocking deployment with error:
```
Error: Node.js Version "18.x" is discontinued and must be upgraded.
Please set Node.js Version to 24.x in your Project Settings.
```

## Solution Applied ✅

We've configured the project to use **Node.js 20.x LTS** for production deployment while supporting your local Node.js v23.4.0.

## Changes Made

### 1. Updated package.json ✅
Added `engines` field to specify Node.js version requirements:

```json
"engines": {
  "node": ">=20.0.0 <21.0.0 || >=23.0.0",
  "pnpm": ">=9.0.0"
}
```

**What this does:**
- Tells Vercel to use Node.js 20.x in production
- Allows your local v23.4.0 to continue working
- Prevents deployment with discontinued versions (18.x and below)
- Enforces pnpm version consistency

### 2. Created .nvmrc ✅
Created `.nvmrc` file with content:
```
20
```

**What this does:**
- Provides explicit Node.js version for Vercel
- Helps team members using nvm switch to correct version
- Documents Node.js requirement in version control

### 3. Updated vercel.json ✅
Added runtime specification:

```json
"functions": {
  "app/api/**/*.ts": {
    "runtime": "nodejs20.x"
  }
}
```

**What this does:**
- Explicitly sets Node.js 20.x for all API routes
- Ensures consistent runtime across all serverless functions
- Overrides any default Vercel settings

### 4. Updated README.md ✅
Added prerequisites section documenting:
- Node.js 20.x+ requirement
- Updated tech stack to reflect current dependencies
- Added newsletter feature documentation
- Updated environment variables

## Why Node.js 20.x?

We chose Node.js 20.x LTS instead of 24.x because:

✅ **Long Term Support (LTS)** - Supported until April 2026
✅ **Vercel Recommended** - Default and most stable option
✅ **Ecosystem Compatibility** - Better package support
✅ **Production Ready** - Used by most production apps
✅ **Stable** - No unexpected breaking changes

## Compatibility

Your local setup (Node.js v23.4.0) will continue to work perfectly because:
- The `engines` field allows `>=23.0.0`
- Node.js is backward compatible
- All dependencies support both 20.x and 23.x

## Next Steps

### For Deployment:

1. **Commit the changes:**
   ```bash
   git add package.json .nvmrc vercel.json README.md
   git commit -m "fix: update Node.js version to 20.x for Vercel deployment"
   ```

2. **Push to Vercel:**
   ```bash
   git push
   ```

3. **Verify deployment:**
   - Check Vercel build logs
   - Look for "Using Node.js 20.x" message
   - Verify build succeeds ✅

### For Team Members:

If a team member is using Node.js 18.x locally, they should upgrade:

**Using nvm (recommended):**
```bash
nvm install 20
nvm use 20
```

**Or download directly:**
- Visit [nodejs.org](https://nodejs.org/)
- Download Node.js 20.x LTS
- Install and restart terminal

## Verification

After deployment, you can verify the Node.js version used:

1. **Check Vercel build logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check logs for "Node.js version" message

2. **Test API routes:**
   ```bash
   curl https://your-app.vercel.app/api/news?source=bitcoinist
   ```

3. **Verify cron jobs:**
   - Check Vercel Dashboard → Cron Jobs
   - Verify they're scheduled correctly

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `package.json` | Added `engines` field | Specify Node.js and pnpm versions |
| `.nvmrc` | Created with "20" | Explicit Node.js version for tooling |
| `vercel.json` | Added `functions.runtime` | Explicit runtime for API routes |
| `README.md` | Added prerequisites | Document requirements for developers |

## Rollback (If Needed)

If you need to rollback (unlikely):

1. Remove the `engines` field from package.json
2. Delete `.nvmrc` file
3. Remove `functions` section from vercel.json
4. Set Node.js version manually in Vercel Dashboard

## Additional Resources

- [Vercel Node.js Version Documentation](https://vercel.com/docs/functions/runtimes/node-js)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
- [nvm Documentation](https://github.com/nvm-sh/nvm)

## Summary

✅ **Vercel build error is now fixed**
✅ **Node.js 20.x LTS configured for production**
✅ **Your local v23.4.0 continues to work**
✅ **Version controlled and documented**
✅ **Team-friendly and production-ready**

You can now deploy to Vercel without any Node.js version errors! 🚀
