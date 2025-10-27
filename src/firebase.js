// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, runTransaction } from "firebase/firestore";

// 1. Get the configuration from Netlify's Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. Get the specific App ID for Firestore paths
export const currentAppId = import.meta.env.VITE_APP_ID || 'default-issue-tracker';

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// 5. Export everything the app needs
export const firebase = {
  // Core
  app,
  auth,
  db,
  // Auth methods
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  signInWithCustomToken,
  // Firestore methods
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction
};
