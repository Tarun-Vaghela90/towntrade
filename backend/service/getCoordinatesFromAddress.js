const axios = require("axios");

async function getCoordinatesFromAddress(address) {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    // Nominatim OpenStreetMap API
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "MyApp/1.0 (your-email@example.com)" // Nominatim requires a User-Agent
      }
    });

    console.log("OSM Geocode Response:", response.data);

    if (response.data.length > 0) {
      const location = response.data[0];
      return [parseFloat(location.lon), parseFloat(location.lat)]; // [lng, lat]
    } else {
      throw new Error("No results found for the given address");
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
    throw new Error("Invalid location name. Could not fetch coordinates.");
  }
}

module.exports = getCoordinatesFromAddress;
