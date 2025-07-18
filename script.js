const visitedCountries = JSON.parse(localStorage.getItem('visitedCountries')) || ['Canada', 'United States of America'];
let activePinIndex = null;
const visitedPins = JSON.parse(localStorage.getItem('visitedPins')) || [
  { lat: 40.7128, lng: -74.0060, size: .5, label: "New York – Group Trip", type: "visited", 
    photos: [] },
  { lat: 43.6511, lng: 	-79.3839, size: .5, label: "Toronto – My love", type: "visited", 
    photos: []},
  { lat: 45.5017, lng: 	-73.5673, size: .5, label: "Montreal – Winter 2024", type: "visited",
    photos: []  },
  { lat: 35.7143, lng: 	-83.5102, size: .5, label: "Gatlinburg – Winter 2023", type: "visited",
    photos: []},
  { lat: 33.7490, lng: 	-84.3880, size: .5, label: "Atlanta – Summer 2025", type: "visited",
    photos: []},
  { lat: 33.4735, lng: 	-82.0105, size: .5, label: "Augusta – Me", type: "visited",
    photos: []}
];

const wishlistPins = JSON.parse(localStorage.getItem('wishlistPins')) || [
  { lat: 48.8566, lng: 2.3522, size: .5, label: "Paris – Someday ❤️", type: "wishlist" },
  { lat: 41.8719, lng: 12.5674, size: .5, label: "Italy – Someday ❤️", type: "wishlist" },
  { lat: 35.6762, lng: 139.6503, size: .5, label: "Tokyo – Winter 2025 🌸", type: "wishlist" }
];

const allPins = [...visitedPins, ...wishlistPins];

const world = Globe()
  (document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
  .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
  .pointsData(allPins)
  .pointLabel('label')
  .pointColor(d => d.type === "visited" ? '#00ffffff' : '#bd1212ff')
  .pointAltitude('size');

// Load countries
fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
  .then(res => res.json())
  .then(worldData => {
    const countries = window.topojson.feature(worldData, worldData.objects.countries).features;

    world
      .polygonsData(countries)
      .polygonAltitude(0.01)
      .polygonCapColor(feat =>
        visitedCountries.includes(feat.properties.name) //Highlight visited countries
          ? 'rgba(79, 202, 86, 0.6)'
          : 'rgba(255,255,255,0.05)'
      )
      .polygonSideColor(() => 'rgba(0, 100, 200, 0.15)')
      .polygonStrokeColor(() => '#111');
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

  const newPin = { lat, lng, size: 0.5, label, type };
  allPins.push(newPin);

  // Save to localStorage
  if (type === "visited") {
    visitedPins.push(newPin);
    localStorage.setItem('visitedPins', JSON.stringify(visitedPins));
  } else {
    wishlistPins.push(newPin);
    localStorage.setItem('wishlistPins', JSON.stringify(wishlistPins));
  }
  world.pointsData(allPins); // update globe
});

document.getElementById('addCountry').addEventListener('click', e => {
  e.preventDefault();

  const country = document.getElementById('countryName').value.trim();
  if (!country) return alert("Enter a country name");

  visitedCountries.push(country);
  localStorage.setItem('visitedCountries', JSON.stringify(visitedCountries));

  // Re-highlight countries
  fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
    .then(res => res.json())
    .then(worldData => {
      const countries = window.topojson.feature(worldData, worldData.objects.countries).features;
      world.polygonsData(countries);
    });
});

function uploadPhoto() {
  const file = document.getElementById("photo-upload").files[0];
  if (!file) return alert("Please select a file");
  if (activePinIndex === null) return alert("No pin selected!");

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
        if (!allPins[activePinIndex].photos) allPins[activePinIndex].photos = [];
        allPins[activePinIndex].photos.push(url);

        // Save to localStorage
        if (allPins[activePinIndex].type === "visited") {
          visitedPins.forEach(pin => {
            if (pin.lat === allPins[activePinIndex].lat && pin.lng === allPins[activePinIndex].lng && pin.label === allPins[activePinIndex].label) {
              if (!pin.photos) pin.photos = [];
              pin.photos.push(url);
            }
          });
          localStorage.setItem('visitedPins', JSON.stringify(visitedPins));
        } else {
          wishlistPins.forEach(pin => {
            if (pin.lat === allPins[activePinIndex].lat && pin.lng === allPins[activePinIndex].lng && pin.label === allPins[activePinIndex].label) {
              if (!pin.photos) pin.photos = [];
              pin.photos.push(url);
            }
          });
          localStorage.setItem('wishlistPins', JSON.stringify(wishlistPins));
        }

        // Update gallery and globe
        gallery.innerHTML = allPins[activePinIndex].photos.map(url => `<img src="${url}" alt="memory">`).join("");
        world.pointsData(allPins);
      });
    }
  );
}

const auth = firebase.auth();

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("auth-status").innerText = `Welcome, ${userCredential.user.email}`;
      document.getElementById("auth-box").style.display = "none";
      document.getElementById("upload-ui").style.display = "block"; // show upload form
    })
    .catch(error => {
      console.error(error);
      document.getElementById("auth-status").innerText = "Login failed.";
    });
}


