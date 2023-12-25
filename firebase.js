import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBiCYQPLnaeZYTWzk8XpKGX6VJH70_af8s",
  authDomain: "mobil-ca964.firebaseapp.com/",
  projectId: "mobil-ca964",
  storageBucket: "mobil-ca964.appspot.com",
  messagingSenderId: "274820530124",
  appId: "1:68136057989:android:92cf7b96ec61e39580fdec",
  storageBucket: 'gs://mobil-ca964.appspot.com'
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {auth, db, storage};