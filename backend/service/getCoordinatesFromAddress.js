const axios = require("axios");

async function getCoordinatesFromAddress(address) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log("service",apiKey)
    if (!apiKey) {
      throw new Error("Google Maps API key missing");
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await axios.get(url);
    console.log("Geocode API Response:", response.data);

    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return [location.lng, location.lat];  // GeoJSON expects [lng, lat]
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
    throw new Error("Invalid location name. Could not fetch coordinates.");
  }
}

module.exports = getCoordinatesFromAddress;

