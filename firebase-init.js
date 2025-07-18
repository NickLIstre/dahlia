// firebase-init.js
const firebaseConfig = {
  apiKey: "AIzaSyD-lZwixaJeRa8rwbgbr8giSDh-AIsqzr8",
  authDomain: "stephanotis-c168c.firebaseapp.com",
  projectId: "stephanotis-c168c",
  storageBucket: "stephanotis-c168c.firebasestorage.app",
  messagingSenderId: "313775180247",
  appId: "1:313775180247:web:d7aafa9bbfa2ffa0716392"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
