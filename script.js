let visitedCountries = [];
let activePinIndex = null;

// Initialize Firebase
const auth = firebase.auth();
const db = firebase.firestore();

let allPins = []; // Will be loaded from Firestore

// Load visitedCountries from Firestore (shared for all users)
db.collection('shared').doc('visitedCountries').onSnapshot(doc => {
  visitedCountries = doc.exists ? doc.data().countries : [];
  // Re-render polygons if globe is already loaded
  if (window.world && window.countriesData) {
    world.polygonsData(window.countriesData);
  }
});

const world = Globe()
  (document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
  .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
  .pointsData(allPins)
  .pointLabel('label')
  .pointColor(d => d.type === "visited" ? '#00ffffff' : '#bd1212ff')
  .pointAltitude('size');

// Load pins from Firestore (real-time updates)
db.collection('pins').onSnapshot(snapshot => {
  allPins = [];
  snapshot.forEach(doc => {
    const pin = doc.data();
    pin._id = doc.id; // Save Firestore doc id for later updates
    allPins.push(pin);
  });
  world.pointsData(allPins);
});

// Load countries and keep reference for re-rendering
fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
  .then(res => res.json())
  .then(worldData => {
    const countries = window.topojson.feature(worldData, worldData.objects.countries).features;
    window.countriesData = countries; // Save for later re-render

    world
      .polygonsData(countries)
      .polygonAltitude(0.01)
      .polygonCapColor(feat =>
        visitedCountries.includes(feat.properties.name)
          ? 'rgba(79, 202, 86, 0.6)'
          : 'rgba(255,255,255,0.05)'
      )
      .polygonSideColor(() => 'rgba(0, 100, 200, 0.15)')
      .polygonStrokeColor(() => '#111');
    window.world = world; // Save for later re-render
  });

// Auto-rotate option
setTimeout(() => {
  world.controls().autoRotate = false;
  world.controls().autoRotateSpeed = 0.3;
}, 1000);

const modal = document.getElementById("photo-modal");
const gallery = document.getElementById("photo-gallery");
const closeBtn = document.getElementById("close-modal");

world
  .pointOfView({ lat: 20, lng: 0, altitude: 2 }, 0)
  .pointAltitude(0.5) // increase this value for bigger pins
  .onPointClick(point => {
    // Find the index of the clicked pin
    activePinIndex = allPins.findIndex(
      p => p.lat === point.lat && p.lng === point.lng && p.label === point.label
    );
    if (point.photos && point.photos.length > 0) {
      gallery.innerHTML = point.photos.map(url => `<img src="${url}" alt="memory">`).join("");
    } else {
      gallery.innerHTML = "<p>No photos yet. Upload one!</p>";
    }
    modal.style.display = "flex";
  });

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

document.getElementById('addPin').addEventListener('click', e => {
  e.preventDefault();

  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  const label = document.getElementById('label').value;
  const type = document.getElementById('type').value;

  if (isNaN(lat) || isNaN(lng) || !label) return alert("Please fill out all fields.");

  const newPin = { lat, lng, size: 0.5, label, type, photos: [] };

  // Save to Firestore
  db.collection('pins').add(newPin)
    .then(() => {
      // Firestore onSnapshot will update allPins and globe
      document.getElementById('lat').value = '';
      document.getElementById('lng').value = '';
      document.getElementById('label').value = '';
      document.getElementById('type').value = 'visited';
    })
    .catch(err => {
      alert("Failed to add pin.");
      console.error(err);
    });
});

document.getElementById('addCountry').addEventListener('click', e => {
  e.preventDefault();

  const country = document.getElementById('countryName').value.trim();
  if (!country) return alert("Enter a country name");

  // Add to Firestore shared document
  db.collection('shared').doc('visitedCountries').get().then(doc => {
    let countries = doc.exists ? doc.data().countries : [];
    if (!countries.includes(country)) countries.push(country);
    db.collection('shared').doc('visitedCountries').set({ countries });
  });

  document.getElementById('countryName').value = '';
});

function uploadPhoto() {
  const file = document.getElementById("photo-upload").files[0];
  if (!file) return alert("Please select a file");
  if (activePinIndex === null) return alert("No pin selected!");

  const pin = allPins[activePinIndex];
  const storageRef = firebase.storage().ref(`globe-photos/${Date.now()}_${file.name}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on(
    'state_changed',
    snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      document.getElementById("upload-status").innerText = `Uploading... ${progress.toFixed(0)}%`;
    },
    error => {
      alert("Upload failed.");
      console.error(error);
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then(url => {
        document.getElementById("upload-status").innerText = `Uploaded!`;
        // Add photo URL to the pin's photos array
        if (!pin.photos) pin.photos = [];
        pin.photos.push(url);

        // Update pin in Firestore
        if (pin._id) {
          db.collection('pins').doc(pin._id).update({ photos: pin.photos })
            .then(() => {
              gallery.innerHTML = pin.photos.map(url => `<img src="${url}" alt="memory">`).join("");
              world.pointsData(allPins);
            })
            .catch(err => {
              alert("Failed to save photo to pin.");
              console.error(err);
            });
        }
      });
    }
  );
}

// login() function is not used on this page, but kept for completeness
function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("auth-status").innerText = `Welcome, ${userCredential.user.email}`;
      document.getElementById("auth-box").style.display = "none";
      document.getElementById("upload-ui").style.display = "block";
    })
    .catch(error => {
      console.error(error);
      document.getElementById("auth-status").innerText = "Login failed.";
    });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show your install button here
  document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      deferredPrompt = null;
    });
  }
});

