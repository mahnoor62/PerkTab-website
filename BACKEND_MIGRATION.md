# Backend Migration Guide

The backend has been successfully separated from Next.js to a standalone Node.js/Express server.

## What Changed

### Backend (New Structure)
- Created `backend/` folder with Express.js server
- All API routes moved to `backend/routes/`
- All models moved to `backend/models/`
- All library functions moved to `backend/lib/`
- Server runs independently on port 3001 (configurable)

### Frontend (Next.js)
- Removed Next.js API routes (`app/api/`)
- Updated all API calls to use backend server
- Created `lib/api.js` for client-side API calls
- Created `lib/api-server.js` for server-side API calls
- Frontend now communicates with backend via HTTP

## Setup Instructions

### 1. Backend Setup

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

### 2. Frontend Setup

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
API_URL=http://localhost:5000
```

### 3. Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## Migration Steps Completed

1. ✅ Created Express.js backend server
2. ✅ Moved all models to backend
3. ✅ Moved all library functions to backend
4. ✅ Created Express routes for all API endpoints
5. ✅ Configured CORS for frontend-backend communication
6. ✅ Updated frontend to use backend API
7. ✅ Maintained authentication flow with cookies
8. ✅ Preserved all existing functionality

## Important Notes

- **Authentication**: Uses HTTP-only cookies, same as before
- **File Uploads**: Files are stored in `backend/uploads/` and served at `/uploads/` endpoint
- **Database**: Still uses MongoDB with same connection string
- **Environment Variables**: Backend and frontend have separate `.env` files
- **CORS**: Configured to allow requests from frontend URL

## API Endpoints

All endpoints are now available at `http://localhost:5000/api/`:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/levels`
- `POST /api/levels`
- `GET /api/levels/:level`
- `PUT /api/levels/:level`
- `DELETE /api/levels/:level`
- `POST /api/upload`

## Cleanup (Optional)

After verifying everything works, you can optionally remove:

1. **Old Next.js API routes** (no longer needed):
   - `app/api/` folder

2. **Old library files** (no longer used):
   - `lib/auth.js`
   - `lib/db.js`
   - `lib/levels.js`
   - `lib/seed.js`

3. **Old models** (moved to backend):
   - `models/Admin.js`
   - `models/LevelConfig.js`

4. **Unused dependencies** from `package.json`:
   - `mongoose` (if not used elsewhere)
   - `bcryptjs` (if not used elsewhere)
   - `jsonwebtoken` (if not used elsewhere)
   - `sharp` (if not used elsewhere)

**Note**: Keep these files if you want a reference or backup. They won't interfere with the new setup.

## File Uploads Migration

If you have existing uploaded files in `public/uploads/`, you should copy them to `backend/uploads/`:

```bash
# Windows (PowerShell)
Copy-Item -Path "public\uploads\*" -Destination "backend\uploads\" -Recurse

# Linux/Mac
cp -r public/uploads/* backend/uploads/
```

## Troubleshooting

1. **CORS errors**: Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
2. **Cookie issues**: Ensure both frontend and backend are on same domain or configure CORS properly
3. **File uploads**: Make sure `backend/uploads/` directory exists and is writable
4. **Database connection**: Verify MongoDB is running and `MONGO_URL` is correct
5. **Port conflicts**: Ensure port 3001 (backend) and 3000 (frontend) are available

