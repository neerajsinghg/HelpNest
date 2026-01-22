# Firebase Cloud Messaging (FCM) Setup Guide for HelpNest

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to <https://console.firebase.google.com/>
2. Click "Add Project"
3. Name: "HelpNest"
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Add Android App

1. In Firebase Console, click "Add app" → Android
2. Android package name: `com.helpnest.app` (or your package name)
3. Download `google-services.json`
4. Place in: `d:\HelpNest\mobile-app\android\app\google-services.json`

### Step 3: Install Dependencies

```bash
cd d:\HelpNest\mobile-app
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Step 4: Configure Android

#### android/build.gradle

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

#### android/app/build.gradle

```gradle
// At the bottom of the file, add:
apply plugin: 'com.google.gms.google-services'
```

---

## 📱 Mobile App Implementation

### File: `src/services/fcm.js`

```javascript
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
    }
    return false;
};

export const getFCMToken = async () => {
    try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

export const registerFCMToken = async (userId, token, API_URL, authToken) => {
    try {
        await axios.post(
            `${API_URL}/users/${userId}/fcm-token`,
            { fcm_token: token },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        console.log('FCM Token registered successfully');
    } catch (error) {
        console.error('Error registering FCM token:', error);
    }
};

export const setupNotificationListeners = (navigation) => {
    // Foreground notification handler
    messaging().onMessage(async remoteMessage => {
        console.log('Foreground notification:', remoteMessage);
        Alert.alert(
            remoteMessage.notification.title,
            remoteMessage.notification.body
        );
    });

    // Background notification opened
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened app from background:', remoteMessage);
        handleNotificationNavigation(remoteMessage, navigation);
    });

    // App opened from quit state
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('Notification opened app from quit state:', remoteMessage);
                handleNotificationNavigation(remoteMessage, navigation);
            }
        });

    // Background handler (must be outside of component)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background message:', remoteMessage);
    });
};

const handleNotificationNavigation = (remoteMessage, navigation) => {
    const { type, job_id, kyc_status } = remoteMessage.data;

    switch (type) {
        case 'job_update':
            navigation.navigate('JobTracking', { jobId: job_id });
            break;
        case 'new_job_request':
            navigation.navigate('ProviderHome');
            break;
        case 'kyc_status_update':
            navigation.navigate('Settings');
            break;
        case 'payment_received':
            navigation.navigate('Earnings');
            break;
        default:
            break;
    }
};
```

### Update `App.js`

```javascript
import React, { useEffect } from 'react';
import { requestUserPermission, getFCMToken, setupNotificationListeners } from './src/services/fcm';

function App() {
    useEffect(() => {
        const initFCM = async () => {
            const hasPermission = await requestUserPermission();
            if (hasPermission) {
                const token = await getFCMToken();
                // Register token with backend after login
                // registerFCMToken(userId, token, API_URL, authToken);
            }
            
            setupNotificationListeners(navigation);
        };

        initFCM();
    }, []);

    return (
        // Your app components
    );
}
```

---

## 🔧 Backend Implementation

### File: `backend/app/services/fcm_service.py`

```python
import httpx
from typing import List, Dict

class FCMService:
    def __init__(self, server_key: str):
        self.server_key = server_key
        self.fcm_url = "https://fcm.googleapis.com/fcm/send"
    
    async def send_notification(
        self,
        fcm_tokens: List[str],
        title: str,
        body: str,
        data: Dict = None
    ):
        """Send push notification via FCM"""
        
        headers = {
            "Authorization": f"key={self.server_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "registration_ids": fcm_tokens,
            "notification": {
                "title": title,
                "body": body,
                "sound": "default"
            },
            "data": data or {},
            "priority": "high"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.fcm_url,
                json=payload,
                headers=headers
            )
            return response.json()

# Initialize FCM service
# Get server_key from Firebase Console → Project Settings → Cloud Messaging
fcm_service = FCMService(server_key="YOUR_SERVER_KEY_HERE")
```

### Update User Route for FCM Token

```python
@router.post("/{user_id}/fcm-token")
async def register_fcm_token(
    user_id: str,
    fcm_token: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Register user's FCM token for push notifications"""
    
    await db.get_db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"fcm_token": fcm_token}}
    )
    
    return {"message": "FCM token registered successfully"}
```

### Send Notifications from Routes

```python
from app.services.fcm_service import fcm_service

# In jobs route (when job status changes)
@router.put("/{job_id}/status")
async def update_job_status(...):
    # ... update job status logic
    
    # Get customer & provider FCM tokens
    customer = await db.get_db().users.find_one({"_id": ObjectId(job["customer_id"])})
    provider = await db.get_db().users.find_one({"_id": ObjectId(job["provider_id"])})
    
    tokens = []
    if customer.get("fcm_token"):
        tokens.append(customer["fcm_token"])
    if provider.get("fcm_token"):
        tokens.append(provider["fcm_token"])
    
    if tokens:
        await fcm_service.send_notification(
            fcm_tokens=tokens,
            title="Job Status Updated",
            body=f"Job #{job_id[:6]} is now {new_status}",
            data={
                "type": "job_update",
                "job_id": job_id,
                "status": new_status
            }
        )
```

---

## 🔐 Get Firebase Server Key

1. Go to Firebase Console
2. Project Settings → Cloud Messaging
3. Copy "Server key"
4. Add to `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    # ... existing settings
    FCM_SERVER_KEY: str = "YOUR_FIREBASE_SERVER_KEY_HERE"
```

---

## 📝 Environment Setup

### backend/.env

```
FCM_SERVER_KEY=AAAA...your-firebase-server-key
```

### Mobile app permissions

#### android/app/src/main/AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## ✅ Testing FCM

### Test from Firebase Console

1. Firebase Console → Cloud Messaging → Send test message
2. Add your FCM token
3. Send notification

### Test from Backend

```python
# Test endpoint
@router.post("/test-notification")
async def test_notification(fcm_token: str):
    result = await fcm_service.send_notification(
        fcm_tokens=[fcm_token],
        title="Test Notification",
        body="This is a test from HelpNest!",
        data={"type": "test"}
    )
    return result
```

---

## 🎯 Notification Types

1. **Job Request** → Provider gets notified
2. **Job Accepted** → Customer gets notified
3. **Job Completed** → Customer gets notified to review
4. **Payment Received** → Provider gets notified
5. **KYC Approved/Rejected** → Provider gets notified
6. **New Review** → Provider gets notified

---

## Production Checklist

- [ ] Firebase project created
- [ ] `google-services.json` downloaded and placed
- [ ] Dependencies installed
- [ ] FCM server key configured
- [ ] Notification permissions requested
- [ ] FCM token registration working
- [ ] Foreground notifications displaying
- [ ] Background notifications working
- [ ] Notification click navigation working
- [ ] Backend sending notifications on events
