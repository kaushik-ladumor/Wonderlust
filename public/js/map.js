
// Parsing coordinates from the listing geometry
const parsedCoordinates = JSON.parse(JSON.stringify(listing.geometry.coordinates));
console.log("Parsed Coordinates:", parsedCoordinates);

// Initializing the Mapbox map
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // ID of the container where the map will render
    style: 'mapbox://styles/mapbox/streets-v11', // Map style
    center: parsedCoordinates, // Centering the map at the coordinates
    zoom: 9 // Initial zoom level
});

// Adding a marker with a popup
const marker = new mapboxgl.Marker({ color: "red" }) // Custom red marker
    .setLngLat(parsedCoordinates) // Set marker position
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // Popup with offset
            .setHTML(`
                <h4>${listing.location}</h4>
                <p>Exact location provided after booking.</p>
            `) // Popup content
    )
    .addTo(map); // Add marker to the map