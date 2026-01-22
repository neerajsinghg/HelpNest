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
   ```

2. The server will start at `http://127.0.0.1:8000`.

## 4. Open Mobile App

1. Open a **new** terminal window.
2. Navigate to the mobile app directory:

   ```powershell
   cd d:\HelpNest\mobile-app
   ```

3. Start the Expo development server:

   ```powershell
   npm start
   ```

   *or*

   ```powershell
   npx expo start
   ```

4. Scan the QR code with your phone (using Expo Go) or press `a` for Android emulator / `i` for iOS simulator.

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
