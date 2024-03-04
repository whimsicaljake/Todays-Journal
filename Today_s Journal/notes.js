firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var currentUser = firebase.auth().currentUser;
    var db = firebase.firestore();

    function fetchDataAndUpdateUI() {
      db.collection("users").doc(currentUser.uid).get().then(function(doc) {
        if (doc.exists) {
          var fullname = doc.data().fullName;
          document.getElementById("fullname").textContent = fullname;
        } else {
          console.log("No such document!");
        }
      }).catch(function(error) {
        console.error("Error getting document:", error);
      });

      var email = currentUser.email;
      document.getElementById("email").textContent = email;

      db.collection("pages").where("uid", "==", currentUser.uid).get().then(function(querySnapshot) {
        var noteCount = querySnapshot.size; // Total number of notes
        document.getElementById("noteCount").textContent = noteCount + " Notes";

        // Clear previous data
        document.getElementById("noteContainer").innerHTML = "";

        querySnapshot.forEach(function(doc) {
          var title = doc.data().title;
          var description = doc.data().description;
          var headerImageURL = doc.data().headerImageURL;
          var pageId = doc.id; // Get the document ID

          var noteListDiv = document.createElement("a");
          noteListDiv.className = "note-list";
          noteListDiv.href = `edit.html?pageId=${pageId}`;

          if (headerImageURL) {
            noteListDiv.style.backgroundImage = `url(${headerImageURL})`;
            // Check if the background color is dark or light
            checkContrast(headerImageURL, function(isDark) {
              if (isDark) {
                noteListDiv.classList.add("light-text"); // Text color light for dark background
              } else {
                noteListDiv.classList.add("dark-text"); // Text color dark for light background
              }
            });
          } else {
            console.warn("Header image URL is empty or undefined for note with title: ", title);
          }

         var titleElement = document.createElement("h2");
titleElement.textContent = title;
titleElement.style.overflow = "hidden";
titleElement.style.whiteSpace = "pre-wrap";
titleElement.style.textOverflow = "ellipsis";
titleElement.style.display = "-webkit-box";
titleElement.style.webkitLineClamp = "2"; // Limit to 2 lines
titleElement.style.webkitBoxOrient = "vertical";


          var descriptionElement = document.createElement("p");
          descriptionElement.className = "description";
          descriptionElement.textContent = description;


          noteListDiv.appendChild(titleElement);
          noteListDiv.appendChild(descriptionElement);

          document.getElementById("noteContainer").appendChild(noteListDiv);
        });
      }).catch(function(error) {
        console.error("Error getting documents: ", error);
      });
    }

    fetchDataAndUpdateUI();

    document.getElementById("refresh").addEventListener("click", function() {
      fetchDataAndUpdateUI();
    });

    document.getElementById("filterInput").addEventListener("input", function() {
      var filterText = this.value.toLowerCase();
      var noteDivs = document.getElementsByClassName("note-list");

      for (var i = 0; i < noteDivs.length; i++) {
        var title = noteDivs[i].getElementsByTagName("h2")[0].textContent.toLowerCase();
        if (title.indexOf(filterText) > -1) {
          noteDivs[i].style.display = "";
        } else {
          noteDivs[i].style.display = "none";
        }
      }
    });

  } else {
    console.log("User is signed out");
  }
});

function checkContrast(imageURL, callback) {
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageURL;

  img.onload = function() {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;

    var rTotal = 0,
        gTotal = 0,
        bTotal = 0;

    for (var i = 0; i < pixels.length; i += 4) {
      rTotal += pixels[i];
      gTotal += pixels[i + 1];
      bTotal += pixels[i + 2];
    }

    var rAverage = rTotal / (pixels.length / 4);
    var gAverage = gTotal / (pixels.length / 4);
    var bAverage = bTotal / (pixels.length / 4);

    // Calculate the brightness using the formula (0.2126 * R + 0.7152 * G + 0.0722 * B)
    var brightness = 0.2126 * rAverage + 0.7152 * gAverage + 0.0722 * bAverage;

    // Determine if the background is dark (brightness < 128) or light (brightness >= 128)
    var isDark = brightness < 128;

    callback(isDark);
  };
}
