# Quick Connection Verification Guide

## Step 1: Verify Backend is Running

**Terminal 1 - Start Backend:**
```bash
cd backend
npm install  # Only needed first time
npm run dev
```

**Expected output:**
```
Backend server running on port 5000
```

**Test backend directly:**
Open in browser: `http://localhost:5000/health`

Should see: `{"status":"ok"}`

## Step 2: Verify Frontend Environment

**Check `.env.local` exists in root directory:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_TOKEN_KEY=dotback_admin_token
API_URL=http://localhost:5000
```

**Important:** 
- File must be named `.env.local` (not `.env`)
- Must be in **root directory** (same level as `package.json`)
- `NEXT_PUBLIC_API_URL` is required for client-side access

## Step 3: Start Frontend

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

**Expected output:**
```
Ready on http://localhost:3000
```

## Step 4: Test Connection

1. Open browser: `http://localhost:3000`
2. Open DevTools (F12) > Console tab
3. Try to login with:
   - Email: `admin@dotback.com`
   - Password: `dotback123`

**What to check:**

### ✅ Success Indicators:
- No errors in browser console
- Login works and redirects to dashboard
- Backend console shows: `POST /api/auth/login`

### ❌ Failure Indicators:
- **"Cannot connect to backend server at http://localhost:5000"** → Backend not running or wrong URL
- **CORS error** → Check `backend/.env` has `FRONTEND_URL=http://localhost:3000`
- **401 Unauthorized** → Backend is reachable but credentials wrong
- **Failed to fetch** → Network error, backend not running

## Step 5: Check Network Tab

1. Open DevTools (F12) > Network tab
2. Try to login
3. Look for request to: `http://localhost:5000/api/auth/login`
4. Check:
   - **Status**: Should be `200` for success
   - **Request URL**: Should be `http://localhost:5000/api/auth/login`
   - **Response**: Should have JSON with admin info

## Common Issues

### Issue: Backend not starting
**Solution:**
- Check MongoDB is running
- Verify `backend/.env` exists
- Check port 3001 is not in use

### Issue: Frontend can't connect
**Solution:**
- Verify `.env.local` exists in root
- Restart Next.js dev server after creating `.env.local`
- Check `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Ensure `NEXT_PUBLIC_AUTH_TOKEN_KEY` is defined

### Issue: CORS errors
**Solution:**
- Verify `backend/.env` has `FRONTEND_URL=http://localhost:3000`
- Restart backend after changing `.env`

## Quick Test Commands

**Test backend health:**
```bash
curl http://localhost:5000/health
```

**Or in browser:**
```
http://localhost:5000/health
```

**Expected response:**
```json
{"status":"ok"}
```

## File Structure

Make sure you have:
```
dot-back/
├── .env.local                    ← Frontend env (in root)
├── backend/
│   ├── .env                     ← Backend env
│   ├── server.js
│   └── package.json
├── lib/
│   ├── api.js                   ← Client-side API utility
│   └── api-server.js            ← Server-side API utility
└── components/
    └── auth/
        └── LoginForm.jsx
```

