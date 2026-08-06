import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";
import path from "path";

// Firebase credentials for dojo-lowticket
const firebaseConfig = {
  apiKey: "AIzaSyBRcOIXxcBfo7sOXb-_DBojjKlLlWgbP5k",
  authDomain: "dojo-lowticket.firebaseapp.com",
  projectId: "dojo-lowticket",
  storageBucket: "dojo-lowticket.firebasestorage.app",
  messagingSenderId: "519350177664",
  appId: "1:519350177664:web:8eadf90023fa006eefbb65",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const mediaFiles = [
  { local: "public/img/bg/02.webm", remote: "img/bg/02.webm", mime: "video/webm" },
  { local: "public/img/bg/02.webp", remote: "img/bg/02.webp", mime: "image/webp" },
  { local: "public/img/banners/hero_01.webp", remote: "img/banners/hero_01.webp", mime: "image/webp" },
  { local: "public/img/banners/hero_02.webp", remote: "img/banners/hero_02.webp", mime: "image/webp" },
  { local: "public/img/banners/hero_03.webp", remote: "img/banners/hero_03.webp", mime: "image/webp" },
  { local: "public/img/banners/hero_04.webp", remote: "img/banners/hero_04.webp", mime: "image/webp" },
  { local: "public/img/banners/banner01.webp", remote: "img/banners/banner01.webp", mime: "image/webp" },
  { local: "public/img/banners/banner02.webp", remote: "img/banners/banner02.webp", mime: "image/webp" },
];

async function uploadAll() {
  console.log("🚀 Starting Upload to Firebase Cloud Storage (dojo-lowticket)...");

  for (const item of mediaFiles) {
    const fullPath = path.resolve(process.cwd(), item.local);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[Skip] File not found: ${item.local}`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(fullPath);
      const storageRef = ref(storage, item.remote);
      console.log(`Uploading ${item.local} -> gs://${firebaseConfig.storageBucket}/${item.remote}...`);
      await uploadBytes(storageRef, buffer, { contentType: item.mime });
      const url = await getDownloadURL(storageRef);
      console.log(`✅ Uploaded successfully! Public URL: ${url}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${item.local}:`, error.message);
    }
  }
}

uploadAll();
