// src/utils/getUserLocation.js
export const getUserLocation = async () => {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Reverse geocode using OpenStreetMap restricted to India
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=IN`
            );
            const data = await res.json();
            if (data.address && data.address.country_code === "in") {
              const locationName =
                data.address.state_district ||
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.suburb ||
                data.address.county ||
                data.address.state ||
                data.display_name;

              resolve(locationName);
            } else {
              resolve(""); // fallback if outside India
            }
          } catch (err) {
            reject("Reverse geocode error: " + err.message);
          }
        },
        async (error) => {
          console.warn("Geolocation error:", error.message);

          // Fallback: IP-based location
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (data.country_code?.toLowerCase() === "in") {
              resolve(data.city);
            } else {
              resolve("");
            }
          } catch (err) {
            reject("IP location error: " + err.message);
          }
        }
      );
    } else {
      reject("Geolocation not supported");
    }
  });
};
