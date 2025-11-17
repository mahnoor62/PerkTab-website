# Quick Start Guide - Separated Backend

## Prerequisites
- Node.js 18+
- MongoDB running locally
- Two terminal windows

## Step 1: Backend Setup

```bash
cd backend
npm install
mkdir uploads
```

Create `backend/.env`:
```env
MONGO_URL=mongodb://127.0.0.1:27017/DotBack
JWT_SECRET=dotback_secret_key
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend (Terminal 1):
```bash
cd backend
npm run dev
```

You should see: `Backend server running on port 5000`

## Step 2: Frontend Setup

In the root directory, create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
API_URL=http://localhost:5000
```

Start the frontend (Terminal 2):
```bash
npm run dev
```

You should see: `Ready on http://localhost:3000`

## Step 3: Access the Application

1. Open `http://localhost:3000` in your browser
2. You'll be redirected to login
3. Use the default credentials:
   - Email: `admin@dotback.com`
   - Password: `dotback123`

## File Uploads

If you have existing uploaded files, copy them:
```bash
# Windows (PowerShell)
Copy-Item -Path "public\uploads\*" -Destination "backend\uploads\" -Recurse -Force

# Linux/Mac
cp -r public/uploads/* backend/uploads/
```

## Troubleshooting

**Backend won't start:**
- Check if MongoDB is running
- Verify `MONGO_URL` in `backend/.env`
- Ensure port 5000 is available

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**Login doesn't work:**
- Verify both servers are running
- Check cookies are enabled in browser
- Clear browser cookies and try again

