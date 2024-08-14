import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
  //testing
  // apiKey: "AIzaSyCTmFMUSQL_lvxZSGzihrx5G7AypB4Uk5Q",
  // authDomain: "testing-855ce.firebaseapp.com",
  // projectId: "testing-855ce",
  // storageBucket: "testing-855ce.appspot.com",
  // messagingSenderId: "1086229411180",
  // appId: "1:1086229411180:web:4a835dadcfb73b08a42f49" 
  
    //main
  apiKey: "AIzaSyD4nUT-gdYQH4wHc0DWDM059afkM35awLg",
  authDomain: "billingsoftware1-63ac7.firebaseapp.com",
  projectId: "billingsoftware1-63ac7",                  
  storageBucket: "billingsoftware1-63ac7.appspot.com",
  messagingSenderId: "880378082734",
  appId: "1:880378082734:web:6fa69ee70c13ab2b41443f"                                                                                                        
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app); 
const auth = getAuth(app); 

export { db, storage, auth }; 
