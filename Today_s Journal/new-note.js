// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAX9OhxfjY2vAFJTYvqocHb__sVuOrCyIU",
  authDomain: "thee-real.firebaseapp.com",
  projectId: "thee-real",
  storageBucket: "thee-real.appspot.com",
  messagingSenderId: "514391345424",
  appId: "1:514391345424:web:a068a3a4d401878b5cbd95",
  measurementId: "G-ZZL9K9S00M"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Function to generate a random ID
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

// Function to create a new page
function createPage(user) {
    // Check if a user is signed in
    if (!user) {
        // If no user is signed in, redirect to the login page
        window.location.href = 'login.html';
        return;
    }

    // Log the current user's ID
    console.log('Current user ID:', user.uid);

    // Get a reference to Firebase Firestore
    const db = firebase.firestore();

    // Generate a unique ID for the page
    const pageId = generateId();

    // Get the current user's UID
    const uid = user.uid;

    // Get the full name of the user from Firestore
    db.collection("users").doc(uid).get()
    .then((doc) => {
        if (doc.exists) {
            const fullName = doc.data().fullName;

            // Generate a unique ID for the page
            const pageId = generateId();

            // Store the page ID along with the user's UID and full name in Firestore
            db.collection("pages").doc(pageId).set({
                uid: uid,
                headerImageURL: 'header.jpg',
                title: 'New note',
                description: 'Add description',
                fullname: fullName
            })
            .then(() => {
                // Redirect the user to the page editor with the generated page ID
                window.location.href = `edit.html?pageId=${pageId}`;
            })
            .catch((error) => {
                console.error("Error creating page: ", error);
            });
        } else {
            console.error("No such document!");
        }
    })
    .catch((error) => {
        console.error("Error getting document:", error);
    });
}

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Listen for authentication state changes
    firebase.auth().onAuthStateChanged(function(user) {
        // Add event listener to the "Create Page" button
        document.getElementById("createPageBtn").addEventListener("click", function() {
            createPage(user);
        });
    });
});