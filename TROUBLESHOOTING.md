# Troubleshooting Backend-Frontend Connection

## Common Issues and Solutions

### ❌ Error: "Failed to fetch" or "Cannot connect to backend server"

This means the frontend cannot reach the backend. Check the following:

#### 1. **Verify Backend is Running**

Check if backend is running:
```bash
cd backend
npm run dev
```

You should see:
```
Backend server running on port 3001
```

#### 2. **Check Backend Port**

Verify the backend is on the correct port (default: 3001):
- Check `backend/.env` file has `BACKEND_PORT=3001`
- Or check the console output when starting backend

#### 3. **Verify Frontend Environment Variables**

Create or check `.env.local` in the **root directory** (not in backend folder):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

**Important**: 
- Restart Next.js dev server after changing environment variables
- `NEXT_PUBLIC_API_URL` must start with `NEXT_PUBLIC_` for client-side access

#### 4. **Check CORS Configuration**

Verify `backend/.env` has:
```env
FRONTEND_URL=http://localhost:3000
```

Or the backend will default to allowing `http://localhost:3000`.

#### 5. **Test Backend Health Endpoint**

Open in browser or use curl:
```bash
# In browser:
http://localhost:3001/health

# Or with curl:
curl http://localhost:3001/health
```

Should return: `{"status":"ok"}`

#### 6. **Check Both Servers Are Running**

You need **TWO terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # if not done yet
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Both should be running simultaneously!

#### 7. **Check Browser Console**

Open browser DevTools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: See if requests are being made and what the response is

#### 8. **Verify URL Format**

Make sure URLs don't have trailing slashes:
- ✅ Correct: `http://localhost:3001`
- ❌ Wrong: `http://localhost:3001/`

### ❌ Error: CORS errors in browser console

If you see CORS errors:

1. **Check backend CORS configuration** in `backend/server.js`
2. **Verify frontend URL** matches what's in `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```
3. **Make sure both servers are on same protocol** (both http or both https)

### ❌ Error: 401 Unauthorized

This means backend is reachable but authentication failed:

1. Check if using correct credentials:
   - Email: `admin@dotback.com`
   - Password: `dotback123`

2. Verify JWT_SECRET matches (if you changed it)

3. Clear browser cookies and try again

### ❌ Error: MongoDB connection failed

If backend won't start:

1. **Check MongoDB is running:**
   ```bash
   # Windows (if installed as service)
   # Check Services for MongoDB
   
   # Or try to connect:
   mongosh
   ```

2. **Verify MongoDB URL** in `backend/.env`:
   ```env
   MONGO_URL=mongodb://127.0.0.1:27017/DotBack
   ```

3. **Check MongoDB is listening** on default port 27017

### 🔍 Quick Diagnostic Steps

1. **Test backend directly:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok"}`

2. **Check frontend API URL:**
   - In browser console, check what URL is being called
   - Should be: `http://localhost:3001/api/auth/login`

3. **Check network tab:**
   - Open DevTools > Network
   - Try to login
   - See if request goes to `http://localhost:3001/api/auth/login`
   - Check response status and error message

4. **Check backend logs:**
   - Look at backend console for incoming requests
   - Should see: `GET /health` or `POST /api/auth/login`

### ✅ Verification Checklist

- [ ] Backend server is running (check console for "Backend server running on port 3001")
- [ ] Frontend server is running (check console for "Ready on http://localhost:3000")
- [ ] `.env.local` exists in root with `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] `backend/.env` exists with `FRONTEND_URL=http://localhost:3000`
- [ ] MongoDB is running
- [ ] Both terminals show no errors
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows requests going to `http://localhost:3001/api/...`

### 🆘 Still Not Working?

1. **Restart both servers:**
   - Stop both (Ctrl+C)
   - Start backend first, then frontend

2. **Clear browser cache and cookies**

3. **Check firewall** isn't blocking port 3001

4. **Try different browser** to rule out browser-specific issues

5. **Check if port 3001 is already in use:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # Linux/Mac
   lsof -i :3001
   ```

