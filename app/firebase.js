import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Votre configuration Firebase (disponible dans la console Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyD8OSfMiWKPMCCJb_4vIqxclUbsRH0yBZU",
  authDomain: "cosplaiiii-c4525.firebaseapp.com",
  projectId: "cosplaiiii-c4525",
  storageBucket: "cosplaiiii-c4525.firebasestorage.app",
  messagingSenderId: "816591255558",
  appId: "1:816591255558:web:1a57b2600c3d49fa65ab87",
  measurementId: "G-DTQK1QD052"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
