const visitedCountries = ['Canada', 'United States of America'];

const visitedPins = [
  { lat: 40.7128, lng: -74.0060, size: .5, label: "New York – Group Trip", type: "visited" },
  { lat: 43.6511, lng: 	-79.3839, size: .5, label: "Toronto – My love's home <3", type: "visited" },
  { lat: 45.5017, lng: 	-73.5673, size: .5, label: "Montreal – Winter 2024", type: "visited" },
  { lat: 35.7143, lng: 	-83.5102, size: .5, label: "Gatlinburg – Winter 2023", type: "visited" },
];

const wishlistPins = [
  { lat: 48.8566, lng: 2.3522, size: 0.5, label: "Paris – Someday ❤️", type: "wishlist" },
  { lat: 35.6762, lng: 139.6503, size: 1, label: "Tokyo – Future Goal 🌸", type: "wishlist" }
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

// Auto-rotate
setTimeout(() => {
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.3;
}, 1000);
