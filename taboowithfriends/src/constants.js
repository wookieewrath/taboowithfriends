import firebase from "firebase";
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA6N6BRvpKPXpjI3of4Wxj5FF_TV1UKhlI",
    authDomain: "taboowithfriends.firebaseapp.com",
    databaseURL: "https://taboowithfriends-default-rtdb.firebaseio.com",
    projectId: "taboowithfriends",
    storageBucket: "taboowithfriends.appspot.com",
    messagingSenderId: "620412403941",
    appId: "1:620412403941:web:2e54ef06e473eee2f6d40c"
  };

firebase.initializeApp(firebaseConfig);

export var db = firebase.firestore();
