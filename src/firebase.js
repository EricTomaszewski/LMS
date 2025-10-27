    import { initializeApp } from "firebase/app";
    import { 
        getAuth, 
        GoogleAuthProvider, 
        signInWithPopup, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged, 
        signOut,
        signInWithCustomToken, // Added for potential environment token
        signInAnonymously // Added for fallback
    } from "firebase/auth";
    import { 
        getFirestore, 
        collection, 
        doc, 
        addDoc, 
        setDoc, 
        updateDoc, 
        query, 
        orderBy, 
        onSnapshot, 
        runTransaction 
    } from "firebase/firestore";

    // Your web app's Firebase configuration from environment variables
    // Ensure VITE_ prefix is used for Vite projects
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // Validate that config values exist
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error("Firebase configuration is missing in environment variables. Make sure your .env file is set up correctly with VITE_ prefixes (e.g., VITE_FIREBASE_API_KEY).");
        // You might want to throw an error or display a message to the user in a real app
    }


    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Export firebase services and methods together for easier import
    export const firebase = {
        // Core
        app,
        // Auth services & methods
        auth,
        GoogleAuthProvider,
        signInWithPopup,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        onAuthStateChanged,
        signOut,
        signInWithCustomToken, 
        signInAnonymously,
        // Firestore services & methods
        db,
        collection,
        doc,
        addDoc,
        setDoc,
        updateDoc,
        query,
        orderBy,
        onSnapshot,
        runTransaction 
    };

    // Define App ID (use environment variable or a default)
    // This should match the path segment used in Firestore rules/data structure
    export const currentAppId = import.meta.env.VITE_APP_INSTANCE_ID || 'default-issue-tracker'; 
