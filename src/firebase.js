// NexaTech Firebase SDK Initialization & Helpers
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Sync user profile to Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'International Partner',
      photoURL: user.photoURL || '',
      role: 'partner',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });

    return user;
  } catch (error) {
    console.error('Google Sign-in error:', error);
    throw error;
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// Firestore Persistence Helpers
export async function submitPartnerInquiry(inquiryData) {
  try {
    const inquiriesCol = collection(db, 'partner_inquiries');
    const docRef = await addDoc(inquiriesCol, {
      ...inquiryData,
      status: 'Under Review',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Submit inquiry error:', error);
    throw error;
  }
}

export async function saveChatMessage(sessionId, message) {
  try {
    const messagesCol = collection(db, 'chat_sessions', sessionId, 'messages');
    await addDoc(messagesCol, {
      ...message,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Save chat message error:', error);
  }
}
