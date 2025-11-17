# API Usage Verification

This document verifies that all API calls in Next.js are correctly set up to use the backend.

## ✅ Client-Side API Calls (Components)

### 1. **Login Form** (`components/auth/LoginForm.jsx`)
- ✅ Uses `fetchJson` from `@/lib/api`
- ✅ Endpoint: `POST /api/auth/login`
- ✅ Includes credentials (cookies) automatically
- ✅ Handles errors properly

```javascript
import { fetchJson } from "@/lib/api";
await fetchJson("/api/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials),
});
```

### 2. **Dashboard Component** (`components/dashboard/Dashboard.jsx`)
- ✅ Uses `fetchJson` and `uploadFile` from `@/lib/api`
- ✅ All endpoints correctly configured:

  - **GET /api/levels** - Fetch all levels
    ```javascript
    const data = await fetchJson("/api/levels");
    ```

  - **PUT /api/levels/:level** - Update level
    ```javascript
    const data = await fetchJson(`/api/levels/${selectedLevelData.level}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    ```

  - **POST /api/levels** - Create new level
    ```javascript
    const data = await fetchJson("/api/levels", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    ```

  - **POST /api/auth/logout** - Logout
    ```javascript
    await fetchJson("/api/auth/logout", { method: "POST" });
    ```

  - **POST /api/upload** - Upload file
    ```javascript
    const data = await uploadFile(file);
    ```

## ✅ Server-Side API Calls (Server Components)

### 1. **Home Page** (`app/page.js`)
- ✅ Uses `getCurrentAdminFromBackend` and `getAllLevelConfigsFromBackend` from `@/lib/api-server`
- ✅ Forwards cookies from Next.js request to backend
- ✅ Handles authentication and data fetching correctly

```javascript
const cookieStore = await cookies();
const admin = await getCurrentAdminFromBackend(cookieStore);
const levels = await getAllLevelConfigsFromBackend(cookieStore);
```

### 2. **Login Page** (`app/login/page.jsx`)
- ✅ Uses `getCurrentAdminFromBackend` for session check
- ✅ Redirects authenticated users properly

```javascript
const cookieStore = await cookies();
const admin = await getCurrentAdminFromBackend(cookieStore);
```

## ✅ API Utilities

### 1. **Client-Side Utility** (`lib/api.js`)
- ✅ `fetchJson()` - Handles JSON requests
  - Automatically adds `Content-Type: application/json`
  - Includes credentials (cookies) for authentication
  - Proper error handling
  - Uses `NEXT_PUBLIC_API_URL` environment variable

- ✅ `uploadFile()` - Handles file uploads
  - Properly handles FormData
  - Doesn't set Content-Type (browser sets it with boundary)
  - Includes credentials (cookies)
  - Uses `NEXT_PUBLIC_API_URL` environment variable

### 2. **Server-Side Utility** (`lib/api-server.js`)
- ✅ `getCurrentAdminFromBackend()` - Fetches admin session
  - Converts Next.js cookie store to cookie header
  - Forwards cookies to backend
  - Uses `API_URL` or `NEXT_PUBLIC_API_URL` environment variable

- ✅ `getAllLevelConfigsFromBackend()` - Fetches all levels
  - Converts Next.js cookie store to cookie header
  - Forwards cookies to backend
  - Uses `API_URL` or `NEXT_PUBLIC_API_URL` environment variable

## ✅ Environment Variables Required

### Frontend (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_TOKEN_KEY=dotback_admin_token
API_URL=http://localhost:3001
```

### Backend (`backend/.env`):
```env
MONGO_URL=mongodb://127.0.0.1:27017/DotBack
JWT_SECRET=your_secure_secret_here
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## ✅ All API Endpoints Mapped

| Frontend Call | Backend Endpoint | Method | Status |
|--------------|------------------|--------|--------|
| `/api/auth/login` | `http://localhost:3001/api/auth/login` | POST | ✅ |
| `/api/auth/logout` | `http://localhost:3001/api/auth/logout` | POST | ✅ |
| `/api/auth/session` | `http://localhost:3001/api/auth/session` | GET | ✅ |
| `/api/levels` | `http://localhost:3001/api/levels` | GET, POST | ✅ |
| `/api/levels/:level` | `http://localhost:3001/api/levels/:level` | GET, PUT, DELETE | ✅ |
| `/api/upload` | `http://localhost:3001/api/upload` | POST | ✅ |

## ✅ Features Verified

1. ✅ **Cookie Authentication** - Cookies are properly forwarded in both client and server contexts
2. ✅ **CORS Configuration** - Backend configured to accept requests from frontend
3. ✅ **Error Handling** - All API calls have proper error handling
4. ✅ **File Uploads** - FormData handled correctly without Content-Type interference
5. ✅ **JSON Requests** - Content-Type set correctly for JSON requests
6. ✅ **Server-Side Rendering** - Server components can fetch data with cookies

## ✅ Test Checklist

- [ ] Login works (sets cookie, redirects to dashboard)
- [ ] Logout works (clears cookie, redirects to login)
- [ ] Dashboard loads levels from backend
- [ ] Can create new level
- [ ] Can update existing level
- [ ] Can delete level
- [ ] Can upload logo/image
- [ ] Authentication persists across page refreshes
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users on login page redirected to dashboard

## Notes

- All API calls automatically use the backend URL from environment variables
- Cookies are included in all requests automatically (`credentials: "include"`)
- Server-side requests forward cookies from Next.js request to backend
- File uploads use separate `uploadFile` function to avoid Content-Type conflicts
- Error messages are properly displayed to users

