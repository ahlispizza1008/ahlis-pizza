import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAPXeITeuLEZlh4MNNxz3NinR9xG-0GBGA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ahlis-pizza-notifications.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ahlis-pizza-notifications",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "885986596622",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:885986596622:web:d2a45e04e6aa718b73695f"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging (only on client side)
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Request Permission and Get Token
export const requestAndGetFCMToken = async () => {
  if (typeof window === 'undefined') return null;

  // Guard for environments where Notification API is not available
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (!messaging) {
        console.warn('Firebase Messaging is not initialized or not supported.');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: "BOK41S7K5cVcbnS3kBteia3RaV-dxoo34fcT7L2w48l4R7e1iD8vYPk9msVLgjfY8Ffuhyira3I3Bdf_krg4-yQ"
      });

      if (token) {
        return token;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn('Permission to notify was denied or dismissed.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Set up foreground message listener
if (messaging) {
  try {
    onMessage(messaging, (payload) => {
      if (payload.notification && payload.notification.title) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/public/icon.png'
          });
        }
      }
    });
  } catch (error) {
    console.warn('Could not register foreground message listener:', error);
  }
}
