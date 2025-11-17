# Logo URL Fix - Backend Connection

## Issue
Logos were not showing in the preview because the logo URLs were relative paths (`/uploads/filename`) that were being resolved against the frontend server instead of the backend server.

## Solution
Updated `LevelPreview.jsx` to prepend the backend URL to logo URLs when they start with `/uploads/`.

## How It Works

1. **Backend serves uploads**: Files are stored in `backend/uploads/` and served at `http://[BACKEND_URL]/uploads/filename`

2. **Frontend displays logos**: The `getLogoUrl()` helper function:
   - Checks if URL is already full (http/https) → returns as is
   - If relative path starts with `/uploads/` → prepends backend URL
   - Uses `NEXT_PUBLIC_API_URL` environment variable or defaults to backend port

## Configuration Required

### Frontend `.env.local` (Root Directory)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000
```

**Important**: This must match your backend port!

### Backend `.env` (Backend Directory)
```env
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:3000
```

## Current Setup

- **Backend Port**: 3000 (as configured in `backend/server.js`)
- **Frontend Port**: 3000 (Next.js default)
- **Logo URLs**: Stored as `/uploads/filename` in database
- **Logo Display**: Automatically converted to `http://localhost:3000/uploads/filename`

## Testing

1. Upload a logo via the dashboard
2. Check the logo URL in the database (should be `/uploads/filename`)
3. In browser DevTools > Network tab, check if logo request goes to:
   - `http://localhost:3000/uploads/[filename]`
4. Verify the logo appears in the preview

## Troubleshooting

### Logo still not showing?

1. **Check backend is serving uploads:**
   ```bash
   # Test directly in browser
   http://localhost:3000/uploads/[your-filename]
   ```
   Should show the image

2. **Check environment variable:**
   - Verify `.env.local` exists in root directory
   - Contains: `NEXT_PUBLIC_API_URL=http://localhost:3000`
   - Restart Next.js dev server after creating/updating `.env.local`

3. **Check browser console:**
   - Open DevTools (F12) > Console
   - Look for "Failed to load logo:" errors
   - Check Network tab for failed image requests

4. **Verify uploads directory:**
   ```bash
   # Check if file exists
   ls backend/uploads/
   ```

5. **Check CORS:**
   - Make sure `backend/.env` has `FRONTEND_URL=http://localhost:3000`
   - Backend should allow requests from frontend

## Port Configuration

⚠️ **Important**: If backend and frontend are both on port 3000, you'll have a conflict!

**Recommended Setup:**
- **Backend**: Port 5000 (or any port other than 3000)
- **Frontend**: Port 3000 (Next.js default)

**If using port 3000 for both:**
- Frontend runs on port 3000
- Backend must run on a different port (e.g., 5000)
- Update `.env.local` to: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Update `backend/.env` to: `BACKEND_PORT=5000`

## Code Changes

**File**: `components/dashboard/LevelPreview.jsx`

Added `getLogoUrl()` helper function that:
- Converts relative logo paths to full backend URLs
- Handles both full URLs and relative paths
- Uses the same backend URL as API calls

```javascript
function getLogoUrl(logoUrl) {
  if (!logoUrl) return null;
  if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
    return logoUrl;
  }
  if (logoUrl.startsWith("/uploads/")) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return `${backendUrl}${logoUrl}`;
  }
  return logoUrl;
}
```

Logo image now uses: `src={getLogoUrl(level.logoUrl)}`

