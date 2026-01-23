# HelpNest Project Setup Guide

Follow these steps to set up and run the HelpNest project systematically.

## 1. Activate Virtual Environment (Backend)

1. Open a terminal (PowerShell or Command Prompt).
2. Navigate to the backend directory:

   ```powershell
   cd d:\HelpNest\backend
   ```

3. Activate the virtual environment:

   ```powershell
   .\venv\Scripts\activate
   ```

   *You should see `(venv)` appear at the start of your command prompt.*

## 2. Ensure MongoDB is Running

1. If MongoDB is installed as a service, it should be running automatically.
2. To verify or start manually, you can check your services or run:

   ```powershell
   mongod
   ```

   *Note: Ensure the backend logs show "Connected to MongoDB".*

## 3. Start Backend Server

1. With the virtual environment activated (from Step 1), run the server:

   ```powershell
   uvicorn app.main:app --reload
   or
   (more prefered) 
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. The server will start at `http://127.0.0.1:8000`.

## 4. Open Mobile App

1. Open a **new** terminal window.
2. Navigate to the mobile app directory:

   ```powershell
   cd d:\HelpNest\mobile-app
   ```

3. **Update API_URL** (Important!):
   - Open `src\context\AuthContext.js`
   - Find your machine's IP address:

     ```powershell
     ipconfig | findstr /i "IPv4"
     ```

   - Update the `API_URL` to match your IP:

     ```javascript
     export const API_URL = 'http://YOUR_IP_HERE:8000/api';
     // Example: export const API_URL = 'http://192.168.0.136:8000/api';
     ```

4. Start the Expo development server:

   ```powershell
   npm start
   ```

   *or with clean cache:*

   ```powershell
   npm start -- --clear

   npx expo start -c --tunnel #clear the cache and start the server
   ```

5. **Scan QR code** with Expo Go app on your phone on same wifi
   - Android: Use Expo Go app
   - iOS: Use Camera app (will open in Expo Go)

6. **Expected behavior**:
   - App loads Login screen (not "Welcome to HelpNest")
   - Can register new account or login
   - Navigation works between screens
   - Role switching works (Customer ↔ Provider)

### Mobile App Architecture

The mobile app uses **Expo Router** with file-based routing:

<!-- ```
app/
├── _layout.tsx              # Root layout with auth protection
├── (auth)/                  # Public routes
│   ├── login.tsx           # Login screen
│   └── register.tsx        # Register screen
├── (client)/               # Customer routes (protected)
│   └── index.tsx          # Service listing
└── (provider)/            # Provider routes (protected)
    └── index.tsx          # Job management
``` -->

### Troubleshooting Mobile App

<!-- **Issue: "Network Error" when logging in** -->

- Ensure backend is running with `--host 0.0.0.0`
- Verify `API_URL` in `AuthContext.js` matches your machine's IP
- Check both devices are on the same WiFi network

<!-- **Issue: App loads slowly** -->

- First load takes 10-15 seconds (normal)
- Subsequent reloads: 2-3 seconds
- Use `npm start -- --clear` to clear cache if needed

<!-- **Issue: "Welcome to HelpNest" stuck screen** -->

- This was fixed by migrating to Expo Router
- If you see this, ensure you're using the latest code

<!-- **Issue: Navigation errors** -->

- Ensure all route files exist in `app/` folder
- Check `app/_layout.tsx` for proper navigation setup

## 5. Open Admin Panel

1. Open a **new** terminal window.
2. Navigate to the admin panel directory:

   ```powershell
   cd d:\HelpNest\admin-panel-react
   ```

3. Start the development server:

   ```powershell
   npm run dev
   ```

4. Open your browser and go to the URL shown (usually `http://localhost:5173`).

## 6. Test Credentials (from seed_enhanced.py)

- **Admin**:
  - Email: `admin@helpnest.com`
  - Password: `Admin@123`
- **Test Users (Customer/Provider)**:
  - Email: `customer1@test.com` (or any `customerX@test.com`)
  - Password: `password123`
