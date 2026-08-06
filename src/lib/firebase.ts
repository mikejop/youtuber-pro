import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * Firebase Client Initialization
 * Project: dojo-lowticket
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBRcOIXxcBfo7sOXb-_DBojjKlLlWgbP5k",
  authDomain: "dojo-lowticket.firebaseapp.com",
  projectId: "dojo-lowticket",
  storageBucket: "dojo-lowticket.firebasestorage.app",
  messagingSenderId: "519350177664",
  appId: "1:519350177664:web:8eadf90023fa006eefbb65",
  measurementId: "G-YWBHQPR96G"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const initAnalytics = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};
