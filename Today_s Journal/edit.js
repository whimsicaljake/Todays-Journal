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

// Get a reference to Firebase Firestore
const db = firebase.firestore();

// Get references to DOM elements
const headerImage = document.getElementById('headerImage');
const header = document.getElementById('header');
const imageInput = document.getElementById('imageInput');
const contentEditor = document.getElementById('contentEditor');
const saveButton = document.getElementById('saveButton');
const title = document.getElementById('title');
const description = document.getElementById('description');

// Initialize Quill
const quill = new Quill('#contentEditor', {
    theme: 'snow' // Use the Snow theme for a clean interface
});

// Get a reference to the Quill editor's content div
const contentEditorDiv = document.querySelector('.ql-editor');


// Function to save page content to Firestore
function savePageContent() {
    // Get the unique page ID from the URL query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const pageId = queryParams.get('pageId');

    // Save header image to Firestore Storage (if image is selected)
    const imageFile = imageInput.files[0];
    if (imageFile) {
        const storageRef = firebase.storage().ref(`pageImages/${pageId}`);
        storageRef.put(imageFile)
            .then((snapshot) => {
                console.log('Header image uploaded successfully!');
                // Get the download URL of the uploaded image
                return snapshot.ref.getDownloadURL();
            })
            .then((downloadURL) => {
                // Update the header image URL in Firestore
                db.collection("pages").doc(pageId).update({
                    headerImageURL: downloadURL
                })
                .then(() => {
                    console.log('Header image URL saved to Firestore!');
                })
                .catch((error) => {
                    console.error('Error saving header image URL:', error);
                });
            })
            .catch((error) => {
                console.error('Error uploading header image:', error);
            });
    }

     // Save content to Firestore
    const content = contentEditorDiv.innerHTML; // Get HTML content from Quill editor

    // Get the text content of the title element
    const pageTitle = title.innerText;
// Get the text content of the description element
const pageDescription = description.innerText;

db.collection("pages").doc(pageId).update({
    content: content,
    title: pageTitle,
    description: pageDescription // Save the extracted text from description
})
    .then(() => {
        console.log('Page content saved successfully!');
        // Create a new paragraph element
    const successMessage = document.createElement('p');
    // Set the text content of the paragraph
    successMessage.textContent = 'Note saved';
     successMessage.classList.add('success-message');
    // Append the paragraph element to the document body or any other suitable container
    document.body.appendChild(successMessage);
        
    })
    .catch((error) => {
        console.error('Error saving page content:', error);
    });
}
// Function to process headers
function processHeaders(content) {
    // Split content by lines
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        // Check if the line starts with '##' (indicating an <h2> tag)
        if (line.trim().startsWith('##')) {
            // Remove '##' and wrap the text in <h2> tags
            return `<h2>${line.trim().substring(2)}</h2>`;
        } else {
            return line; // Keep the line unchanged
        }
    });
    // Join processed lines back together
    return processedLines.join('\n');
}

// Function to fetch page data from Firestore and populate the HTML elements
function fetchPageData() {
    // Get the unique page ID from the URL query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const pageId = queryParams.get('pageId');

    // Get page document from Firestore
    db.collection("pages").doc(pageId).get()
    .then((doc) => {
        if (doc.exists) {
            const data = doc.data();

            // Populate header image
            if (data.headerImageURL) {
               
              header.style.backgroundImage = `url(${data.headerImageURL})`;

            }

            if (data.content) {
                quill.root.innerHTML = data.content;
            }
            
            if (data.title) {
                title.innerText = data.title;
            }
             if (data.description) {
                description.innerText = data.description;
            }
            
            // document.getElementById('title').value = data.title;
        } else {
            console.error("No such document!");
        }
    })
    .catch((error) => {
        console.error("Error getting document:", error);
    });
}

// Call the function to fetch and populate page data when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    fetchPageData();
    // Add event listener to the Quill editor to save content on change
    quill.on('text-change', savePageContent);
});


// Add event listener to the save button (unchanged)
saveButton.addEventListener('click', savePageContent);