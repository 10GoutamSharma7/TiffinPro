import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// You'll need to replace this with your actual Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBFeJ9jGVRSIw1GtAUuVbe76ZSj8hzZhLY",
    authDomain: "flipr-ec895.firebaseapp.com",
    projectId: "flipr-ec895",
    storageBucket: "flipr-ec895.firebasestorage.app",
    messagingSenderId: "405043061504",
    appId: "1:405043061504:web:efa79b5e32257e9e0f89e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
