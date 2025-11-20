# Vercel Environment Variables Setup

This guide explains how to configure environment variables for production deployment on Vercel.

## Problem

In production, your Next.js website needs to connect to your production backend server, not `http://localhost:5000`. The environment variables need to be configured in Vercel's dashboard.

## Required Environment Variables

Set the following environment variables in Vercel:

1. **NEXT_PUBLIC_API_URL** - Your production backend URL
   - Example: `https://perktab-backend.tecshield.net`
   - ⚠️ **Important**: Must start with `NEXT_PUBLIC_` to be available in the browser

2. **NEXT_PUBLIC_AUTH_TOKEN_KEY** - Token storage key (same as local)
   - Example: `dotback_admin_token`

## How to Set Environment Variables in Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (e.g., `perk-tab-website`)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://perktab-backend.tecshield.net` (your actual backend URL)
   - **Environment**: Select `Production`, `Preview`, and/or `Development` as needed
   - Click **Save**
6. Repeat for `NEXT_PUBLIC_AUTH_TOKEN_KEY`:
   - **Key**: `NEXT_PUBLIC_AUTH_TOKEN_KEY`
   - **Value**: `dotback_admin_token`
   - **Environment**: Select appropriate environments
   - Click **Save**

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable for production
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://perktab-backend.tecshield.net

# Set environment variable for preview
vercel env add NEXT_PUBLIC_API_URL preview
# When prompted, enter: https://perktab-backend.tecshield.net

# Set auth token key
vercel env add NEXT_PUBLIC_AUTH_TOKEN_KEY production
# When prompted, enter: dotback_admin_token

# Pull environment variables to verify
vercel env pull .env.production
```

## Important Notes

### Why NEXT_PUBLIC_ prefix?

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without this prefix are only available server-side
- `NEXT_PUBLIC_API_URL` is used in client-side code, so it **must** have this prefix

### Environment-Specific URLs

You can set different URLs for different environments:

- **Production**: `https://perktab-backend.tecshield.net`
- **Preview** (pull requests): Can use staging backend or same as production
- **Development** (local): Uses `.env.local` file (`http://localhost:5000`)

### After Setting Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab in Vercel
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic deployment

2. **Verify** the configuration:
   - Check browser console on your production site
   - You should see: `[API] Configuration: { apiUrl: 'https://perktab-backend.tecshield.net', ... }`
   - If you see `localhost:5000`, the environment variable is not set correctly

## Troubleshooting

### Still seeing "Request is taking too long" error

1. **Check environment variables are set**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` exists and points to your production backend

2. **Check backend is accessible**:
   ```bash
   curl https://perktab-backend.tecshield.net/health
   ```
   Should return: `{"status":"ok"}`

3. **Check CORS configuration**:
   - Ensure your backend allows requests from `https://perk-tab-website.vercel.app`
   - Check backend `FRONTEND_URL` or `ALLOWED_ORIGINS` environment variable

4. **Redeploy after setting variables**:
   - Environment variables are only available after a new deployment
   - Simply setting them doesn't update running deployments

### Browser console shows wrong URL

- Open browser DevTools → Console
- Look for `[API] Configuration:` log
- If it shows `localhost:5000`, the environment variable is not set correctly
- Verify in Vercel Dashboard → Settings → Environment Variables

### Backend CORS errors

- Make sure your backend has CORS configured to allow your Vercel domain
- Update `FRONTEND_URL` or `ALLOWED_ORIGINS` in your backend environment:
  ```
  FRONTEND_URL=https://perk-tab-website.vercel.app
  # OR
  ALLOWED_ORIGINS=https://perk-tab-website.vercel.app
  ```

## Local Development

For local development, create `.env.local` in the `website/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_TOKEN_KEY=dotback_admin_token
```

This file is **not** committed to git and only used locally.

## Summary

**For Production (Vercel):**
- Set `NEXT_PUBLIC_API_URL=https://perktab-backend.tecshield.net` in Vercel Environment Variables
- Set `NEXT_PUBLIC_AUTH_TOKEN_KEY=dotback_admin_token` in Vercel Environment Variables
- Redeploy after setting variables

**For Local Development:**
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000`

The code automatically detects the environment and uses the appropriate URL.

