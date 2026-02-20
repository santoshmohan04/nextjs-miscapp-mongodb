import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// You can find this in your Firebase project settings under "Your apps"
const firebaseConfig = {
  apiKey: "AIzaSyBIzdLXuY_T2NdFxPtbweuee_rcGYphtsg",
  authDomain: "studio-8436417735-c2796.firebaseapp.com",
  projectId: "studio-8436417735-c2796",
  storageBucket: "studio-8436417735-c2796.firebasestorage.app",
  messagingSenderId: "774331607996",
  appId: "1:774331607996:web:9375e8846ff611014319b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

export { app, storage };