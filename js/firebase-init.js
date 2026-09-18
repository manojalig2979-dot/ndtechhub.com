// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCY2gFTgTW3uGgmdbjjyGdWFiIfdpGNgf4",
  authDomain: "ndtechhub-91464.firebaseapp.com",
  databaseURL: "https://ndtechhub-91464-default-rtdb.firebaseio.com",
  projectId: "ndtechhub-91464",
  storageBucket: "ndtechhub-91464.firebasestorage.app",
  messagingSenderId: "326061417911",
  appId: "1:326061417911:web:167c59d85be322652e7432",
  measurementId: "G-23XBQD2Z6F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export if other modules need to use the app instance
export { app, analytics };
