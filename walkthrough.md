# HelpNest Walkthrough

## Prerequisites

- Node.js & npm
- Python 3.8+
- MongoDB (running locally or cloud)
- Expo Go app on your phone (or Android Simulator)

## 1. Running the Backend

The backend is built with FastAPI.

1. Open a terminal in `d:\HelpNest\backend`.
2. Activate virtual environment (if not active):

    ```powershell
    .\venv\Scripts\activate
    ```

3. Run the server:

    ```powershell
    uvicorn app.main:app --reload --port 8000
    ```

    *Note: It should already be running on port 8000 if you haven't stopped it.*
4. View API Docs at `http://localhost:8000/docs`.

## 2. Running the Frontend (Mobile App)

The frontend is built with React Native (Expo).

1. Open a new terminal in `d:\HelpNest\mobile-app`.
2. Install dependencies (if you haven't):

    ```powershell
    npm install
    ```

3. Start the Expo server:

    ```powershell
    npx expo start
    ```

4. **To view on your phone**:
    - Scan the QR code with the **Expo Go** app (Android) or Camera (iOS).
    - Ensure your phone and PC are on the **same Wi-Fi**.
    - *Important*: Update `API_URL` in `src/context/AuthContext.js` with your PC's local IP address (e.g., `http://192.168.1.X:8000/api`) because `localhost` won't work from the phone.

5. **To view on Emulator**:
    - Press `a` for Android Emulator (must be installed/running).

## 3. Testing the App

1. **Register**: Create a new account. You will be logged in as a "Customer".
2. **Switch Role**: Toggle the switch in the top right to become a "Provider".
3. **Create Service**: As a Provider, click "+" to add a service (e.g., "Plumbing", "50").
4. **Book Service**: Switch back to Customer, see the service list, and click "Book".
5. **Manage Job**: Switch to Provider to see the job and "Accept" it.
