import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCz6HWGeQ5T1_AnYyslgZpQHyFsGqYothQ",
    authDomain: "filmes-barbosaflix.firebaseapp.com",
    projectId: "filmes-barbosaflix",
    storageBucket: "filmes-barbosaflix.appspot.com",
    messagingSenderId: "208545325235",
    appId: "1:208545325235:web:4cf44a2ddf14d45f9690c6",
    measurementId: "G-9VBCS6GED0"
};

// Initialize Firebase
const fireBaseApp = initializeApp(firebaseConfig);
const db = getFirestore(fireBaseApp);

export { db };