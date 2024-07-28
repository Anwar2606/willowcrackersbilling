import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  apiKey: "AIzaSyCiW0zeXq9UzxD2-59HWBLQLytHy5RaSp0",
  authDomain: "starbilling-8a6b1.firebaseapp.com",
  projectId: "starbilling-8a6b1",
  storageBucket: "starbilling-8a6b1.appspot.com",
  messagingSenderId: "81943901473",
  appId: "1:81943901473:web:79b0f2650b75465d0efa60"                                                                                                                    
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app); 
const auth = getAuth(app); 

export { db, storage, auth }; 
