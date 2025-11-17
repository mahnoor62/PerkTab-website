## DotBack Admin Dashboard

DotBack is a single-page administrative dashboard built with Next.js (App Router) and Material UI. It lets an administrator configure 10 DotBack levels, each with custom background colors, dot palettes, and branded logos. 

**Note:** The backend has been separated into a standalone Node.js/Express server. See `BACKEND_MIGRATION.md` for details.

### Tech Stack

- **Frontend**: Next.js App Router with server components
- **Backend**: Node.js/Express API server (see `backend/` folder)
- **Database**: MongoDB via Mongoose (backend only)
- **UI**: Material UI v5 with custom themes
- **Authentication**: JWT tokens stored as HTTP-only cookies

### Project Structure Overview

- `app/` – App Router pages
- `components/` – Reusable UI modules (dashboard, auth, layout, theme registry)
- `lib/` – API client utilities (`api.js`, `api-server.js`)
- `backend/` – Standalone Express.js backend server
  - `routes/` – API endpoints (auth, levels, upload)
  - `models/` – Mongoose schemas (`Admin`, `LevelConfig`)
  - `lib/` – Database, auth, and business logic
  - `uploads/` – Uploaded logo files

### Prerequisites

- Node.js 18+
- MongoDB running locally
- Two terminal windows (one for backend, one for frontend)

### Quick Start

**1. Backend Setup:**
```bash
cd backend
npm install
mkdir uploads
# Create backend/.env with MONGO_URL, JWT_SECRET, etc.
npm run dev
```

**2. Frontend Setup:**
```bash
# In root directory
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
```

See `QUICK_START.md` for detailed setup instructions.

### Environment Variables

**Frontend (`.env.local` in root):**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_TOKEN_KEY=dotback_admin_token
API_URL=http://localhost:3000
```

**Backend (`backend/.env`):**
```
MONGO_URL=mongodb://127.0.0.1:27017/DotBack
JWT_SECRET=your_secure_secret_here
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Default Admin Credentials

- Email: `admin@dotback.com`  
- Password: `dotback123`

These are automatically seeded on first backend startup.

### File Uploads

Uploaded logos are stored in `backend/uploads/` and served by the backend server at `/uploads/[filename]`.

### Scripts

- `npm run dev` – Start development server
- `npm run build` – Create production build
- `npm start` – Run production server
- `npm run lint` – Run Next.js / ESLint checks

### Notes

- The dashboard is portrait-friendly and responsive, optimized for 1080×1920 layouts.
- Authentication restricts API and page access to the signed-in admin.
- Theme preference (light/dark) persists across sessions via localStorage.
- MongoDB indexes are created through Mongoose schema definitions.
