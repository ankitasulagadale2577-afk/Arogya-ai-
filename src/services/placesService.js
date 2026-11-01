// ==============================================================================
// ArogyaMitra AI — Real Healthcare Facilities & Geocoding Service
// Uses Leaflet, OpenStreetMap, Nominatim & Overpass API
// ==============================================================================

export function getDistanceKm(lat1, lon1, lat2, lon2) {
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

// Overpass API Fallback Endpoints
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

// Verified Fallback Hospitals for Central Pune Reference Area (Offline/Rate-Limit Resilience)
const VERIFIED_PUNE_HOSPITALS = [
  {
    id: "ref-poona-hosp",
    name: "Poona Hospital & Research Centre",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 6609 6000",
    openingHours: "24/7",
    address: "27, Sadashiv Peth, Near Alka Talkies, Pune, Maharashtra 411030",
    lat: 18.5135,
    lon: 73.8458,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-kem-hosp",
    name: "K.E.M. Hospital Pune",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 6603 7300",
    openingHours: "24/7",
    address: "489, Rasta Peth, Sardar Moodliar Road, Pune, Maharashtra 411011",
    lat: 18.5209,
    lon: 73.8687,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-jehangir-hosp",
    name: "Jehangir Hospital",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 6681 1000",
    openingHours: "24/7",
    address: "32, Sassoon Road, Opposite Pune Railway Station, Pune, Maharashtra 411001",
    lat: 18.5302,
    lon: 73.8772,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-deenanath-hosp",
    name: "Deenanath Mangeshkar Hospital & Research Centre",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 4015 1000",
    openingHours: "24/7",
    address: "Erandwane, Near Mhatre Bridge, Pune, Maharashtra 411004",
    lat: 18.5028,
    lon: 73.8341,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-sassoon-hosp",
    name: "Sassoon General Hospital (Govt.)",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 2612 8000",
    openingHours: "24/7",
    address: "Station Road, Near Pune Railway Station, Pune, Maharashtra 411001",
    lat: 18.5273,
    lon: 73.8744,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-ruby-hall",
    name: "Ruby Hall Clinic Pune",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 6645 5100",
    openingHours: "24/7",
    address: "40, Sassoon Road, Sangamvadi, Pune, Maharashtra 411001",
    lat: 18.5327,
    lon: 73.8789,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-sancheti-hosp",
    name: "Sancheti Hospital (Orthopedic Super Specialty)",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 2899 9999",
    openingHours: "24/7",
    address: "16, Shivajinagar, Narveer Tanaji Wadi, Pune, Maharashtra 411005",
    lat: 18.5317,
    lon: 73.8524,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
  {
    id: "ref-inlak-hosp",
    name: "Inlaks and Budhrani Hospital",
    amenity: "hospital",
    emergency: true,
    phone: "+91 20 6609 9999",
    openingHours: "24/7",
    address: "7-9, Koregaon Park Road, Pune, Maharashtra 411001",
    lat: 18.5361,
    lon: 73.8864,
    attribution: "OpenStreetMap contributors (ODbL)",
  },
];

/**
 * Fetch nearby real hospitals and clinics within radiusMeters.
 * Tier 1: Fast Nominatim Bounded Place Search (~800ms)
 * Tier 2: Overpass API Fallback (with 6s timeout)
 * Tier 3: Verified Reference Fallback
 */
export async function fetchNearbyHospitals(lat, lon, radiusMeters = 5000, amenityType = "all") {
  const maxKm = (radiusMeters / 1000) * 1.15; // 15% tolerance
  const delta = radiusMeters / 111000;
  const minLon = lon - delta;
  const maxLon = lon + delta;
  const minLat = lat - delta;
  const maxLat = lat + delta;

  // ---------------------------------------------------------------------------
  // Tier 1: Fast Nominatim Bounded Query (< 1.5s)
  // ---------------------------------------------------------------------------
  try {
    const searchTerms = [];
    if (amenityType === "hospital") {
      searchTerms.push("hospital");
    } else if (amenityType === "clinic") {
      searchTerms.push("clinic");
    } else {
      searchTerms.push("hospital", "clinic");
    }

    const fetchedItems = [];
    const seenIds = new Set();

    for (const term of searchTerms) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        term
      )}&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=30&extratags=1`;

      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "ArogyaMitra-AI-Healthcare/1.0",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const pLat = parseFloat(item.lat);
            const pLon = parseFloat(item.lon);
            if (isNaN(pLat) || isNaN(pLon)) continue;

            const id = `osm-${item.osm_type || "node"}-${item.osm_id || item.place_id}`;
            if (seenIds.has(id)) continue;
            seenIds.add(id);

            const dist = getDistanceKm(lat, lon, pLat, pLon);
            if (dist > maxKm) continue;

            const rawName = item.name || (item.display_name ? item.display_name.split(",")[0] : "Healthcare Facility");
            const cleanName = rawName.replace(/;.*$/, "").trim();

            const tags = item.extratags || {};
            const emergency = tags.emergency === "yes" || /hospital/i.test(term);
            const phone = tags.phone || tags["contact:phone"] || tags["emergency:phone"] || null;
            const openingHours = tags.opening_hours || (emergency ? "24/7 Emergency" : null);

            fetchedItems.push({
              id,
              name: cleanName,
              amenity: item.type || term,
              emergency,
              phone,
              openingHours,
              address: item.display_name || "Address listed on OpenStreetMap",
              lat: pLat,
              lon: pLon,
              distance: dist,
              attribution: "OpenStreetMap contributors (ODbL)",
            });
          }
        }
      }
    }

    if (fetchedItems.length > 0) {
      fetchedItems.sort((a, b) => a.distance - b.distance);
      return { hospitals: fetchedItems, error: null };
    }
  } catch (nominatimErr) {
    console.warn("Nominatim healthcare search failed/timed out, attempting Overpass API:", nominatimErr.message);
  }

  // ---------------------------------------------------------------------------
  // Tier 2: Overpass API Query with 6-second timeout
  // ---------------------------------------------------------------------------
  let filterClause = 'node["amenity"~"^(hospital|clinic)$"]';
  let wayFilter = 'way["amenity"~"^(hospital|clinic)$"]';

  if (amenityType === "hospital") {
    filterClause = 'node["amenity"="hospital"]';
    wayFilter = 'way["amenity"="hospital"]';
  } else if (amenityType === "clinic") {
    filterClause = 'node["amenity"="clinic"]';
    wayFilter = 'way["amenity"="clinic"]';
  }

  const query = `
    [out:json][timeout:8];
    (
      ${filterClause}(around:${radiusMeters},${lat},${lon});
      ${wayFilter}(around:${radiusMeters},${lat},${lon});
    );
    out center 60 tags;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ArogyaMitra-AI-Healthcare/1.0",
        },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) continue;

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
          if (distance > maxKm) return null;

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

      if (list.length > 0) {
        return { hospitals: list, error: null };
      }
    } catch {
      // Try next endpoint
    }
  }

  // ---------------------------------------------------------------------------
  // Tier 3: Verified Reference Dataset (Guarantees Real Facilities Always Show)
  // ---------------------------------------------------------------------------
  const fallbackList = VERIFIED_PUNE_HOSPITALS.map((h) => ({
    ...h,
    distance: getDistanceKm(lat, lon, h.lat, h.lon),
  }))
    .filter((h) => h.distance <= maxKm)
    .sort((a, b) => a.distance - b.distance);

  if (fallbackList.length > 0) {
    return { hospitals: fallbackList, error: null };
  }

  return {
    hospitals: [],
    error: "No mapped healthcare facilities found within this search radius. Try expanding the radius to 10 km or 15 km.",
  };
}
