// ==============================================================================
// ArogyaMitra AI — Real Healthcare Facilities & Geocoding Service
// Uses Leaflet, OpenStreetMap, Nominatim & Overpass API
// ==============================================================================

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nominatim Geocoding for manual location queries
export async function geocodeLocation(query) {
  if (!query || !query.trim()) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      query.trim()
    )}`;

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "ArogyaMitra-AI-Healthcare-App/1.0",
      },
    });

    if (!res.ok) throw new Error("Geocoding service unavailable.");
    const data = await res.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

// Reverse Geocoding to get location name from coordinates
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "ArogyaMitra-AI-Healthcare-App/1.0",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

export async function fetchNearbyHospitals(lat, lon, radiusMeters = 5000, amenityType = "all") {
  let filterClause = 'node["amenity"~"^(hospital|clinic|doctors)$"]';
  let wayFilter = 'way["amenity"~"^(hospital|clinic|doctors)$"]';
  let relFilter = 'relation["amenity"~"^(hospital|clinic|doctors)$"]';

  if (amenityType === "hospital") {
    filterClause = 'node["amenity"="hospital"]';
    wayFilter = 'way["amenity"="hospital"]';
    relFilter = 'relation["amenity"="hospital"]';
  } else if (amenityType === "clinic") {
    filterClause = 'node["amenity"~"^(clinic|doctors)$"]';
    wayFilter = 'way["amenity"~"^(clinic|doctors)$"]';
    relFilter = 'relation["amenity"~"^(clinic|doctors)$"]';
  }

  const query = `
    [out:json][timeout:25];
    (
      ${filterClause}(around:${radiusMeters},${lat},${lon});
      ${wayFilter}(around:${radiusMeters},${lat},${lon});
      ${relFilter}(around:${radiusMeters},${lat},${lon});
    );
    out center tags;
  `;

  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ArogyaMitra-AI-Healthcare/1.0",
        },
        body: "data=" + encodeURIComponent(query),
      });

      if (!response.ok) {
        lastError = new Error(`Overpass returned status ${response.status}`);
        continue;
      }

      const data = await response.json();
      const elements = data.elements || [];

      const list = elements
        .map((el) => {
          const pLat = el.lat ?? el.center?.lat;
          const pLon = el.lon ?? el.center?.lon;
          if (pLat == null || pLon == null) return null;

          const tags = el.tags || {};
          const name = tags.name || tags["name:en"] || tags["name:hi"] || tags["name:mr"] || "Healthcare Facility";
          const amenity = tags.amenity || "healthcare";
          const emergency = tags.emergency === "yes";
          const phone = tags.phone || tags["contact:phone"] || tags["emergency:phone"] || null;
          const openingHours = tags.opening_hours || null;

          const addressParts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:suburb"],
            tags["addr:city"] || tags["addr:town"] || tags["addr:district"],
            tags["addr:postcode"],
          ].filter(Boolean);

          const address = addressParts.length > 0 ? addressParts.join(", ") : "Address listed on OpenStreetMap";
          const distance = getDistanceKm(lat, lon, pLat, pLon);

          return {
            id: `${el.type}-${el.id}`,
            name,
            amenity,
            emergency,
            phone,
            openingHours,
            address,
            lat: pLat,
            lon: pLon,
            distance,
            attribution: "OpenStreetMap contributors (ODbL)",
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      return { hospitals: list, error: null };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    hospitals: [],
    error: lastError?.message || "Could not retrieve nearby healthcare facilities. The OpenStreetMap service may be temporarily busy.",
  };
}
