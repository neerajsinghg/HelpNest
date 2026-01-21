# HelpNest Deployment Guide

## Backend Deployment (AWS EC2 / Ubuntu)

1. **Launch EC2 Instance**: Use Ubuntu 22.04 LTS.
2. **Install Python & MongoDB**:

    ```bash
    sudo apt update
    sudo apt install python3-pip python3-venv mongodb
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
    ```

3. **Clone Repository**:

    ```bash
    git clone https://github.com/your-repo/helpnest.git
    cd helpnest/backend
    ```

4. **Setup Environment**:

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

5. **Run with Gunicorn**:

    ```bash
    pip install gunicorn
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
    ```

## Frontend Deployment (Expo)

1. **Build for Android/iOS**:

    ```bash
    cd mobile-app
    npm install
    npx expo build:android
    # or
    eas build -p android
    ```

2. **Submit to Play Store** (or distribute APK).

## MongoDB Atlas (Alternative DB)

1. Create Cluster on MongoDB Atlas.
2. Get Connection String.
3. Update `backend/app/core/config.py` or `.env`:
    `MONGODB_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/helpnest"`
