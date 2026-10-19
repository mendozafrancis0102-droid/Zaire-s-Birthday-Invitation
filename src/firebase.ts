import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration from the user's project
const firebaseConfig = {
  apiKey: "AIzaSyD9BfphKfrIZKfv0Ov0v6FzxWycXmknnKM",
  authDomain: "birthday-wishes-5434d.firebaseapp.com",
  projectId: "birthday-wishes-5434d",
  storageBucket: "birthday-wishes-5434d.firebasestorage.app",
  messagingSenderId: "393999402991",
  appId: "1:393999402991:web:a83c91b57cff579934581a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp };