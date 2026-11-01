// ==============================================================================
// ArogyaMitra AI — Real Interactive Hospital Finder & OpenStreetMap
// Leaflet Map + Nominatim Geocoding + Overpass Healthcare Data
// ==============================================================================

import { useState, useEffect } from "react";
import {
  Hospital,
  MapPin,
  Navigation,
  Search,
  Phone,
  AlertTriangle,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";
import LeafletMap from "../components/LeafletMap.jsx";
import {
  geocodeLocation,
  fetchNearbyHospitals,
  reverseGeocode,
} from "../services/placesService.js";
import { useLanguage } from "../context/LanguageContext.jsx";

// Default coordinate: Pune, Maharashtra (Central reference in India)
const DEFAULT_CENTER = { lat: 18.5204, lon: 73.8567 };

export default function HospitalsPage() {
  const { t } = useLanguage();

  const [center, setCenter] = useState([DEFAULT_CENTER.lat, DEFAULT_CENTER.lon]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("Pune, Maharashtra");
  const [cityInput, setCityInput] = useState("");
  const [radius, setRadius] = useState(5000); // 5km
  const [facilityFilter, setFacilityFilter] = useState("all"); // 'all' | 'hospital' | 'clinic'
  const [nameFilter, setNameFilter] = useState("");

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHospitals = async (lat, lon, rad, type) => {
    setLoading(true);
    setError("");
    setSelectedHospital(null);

    const { hospitals: results, error: apiErr } = await fetchNearbyHospitals(
      lat,
      lon,
      rad,
      type
    );

    setLoading(false);

    if (apiErr) {
      setError(apiErr);
    } else {
      setHospitals(results);
      if (results.length === 0) {
        setError(
          "No mapped healthcare facilities found within this search radius. Try increasing the radius or searching a different city."
        );
      }
    }
  };

  // Load initial hospitals (auto-detect user location if available, otherwise default to Pune)
  useEffect(() => {
    let active = true;

    async function init() {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (!active) return;
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            setUserLocation({ lat, lon });
            setCenter([lat, lon]);

            const revName = await reverseGeocode(lat, lon);
            if (active && revName) {
              setLocationName(revName);
            }

            if (active) {
              const { hospitals: results, error: apiErr } = await fetchNearbyHospitals(
                lat,
                lon,
                5000,
                "all"
              );
              if (!active) return;
              setLoading(false);
              if (apiErr) {
                setError(apiErr);
              } else {
                setHospitals(results);
              }
            }
          },
          async () => {
            if (!active) return;
            const { hospitals: results, error: apiErr } = await fetchNearbyHospitals(
              DEFAULT_CENTER.lat,
              DEFAULT_CENTER.lon,
              5000,
              "all"
            );
            if (!active) return;
            setLoading(false);
            if (apiErr) {
              setError(apiErr);
            } else {
              setHospitals(results);
            }
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        const { hospitals: results, error: apiErr } = await fetchNearbyHospitals(
          DEFAULT_CENTER.lat,
          DEFAULT_CENTER.lon,
          5000,
          "all"
        );
        if (!active) return;
        setLoading(false);
        if (apiErr) {
          setError(apiErr);
        } else {
          setHospitals(results);
        }
      }
    }

    init();
    return () => {
      active = false;
    };
  }, []);

  // Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLocation({ lat, lon });
        setCenter([lat, lon]);

        const revName = await reverseGeocode(lat, lon);
        if (revName) setLocationName(revName);

        await loadHospitals(lat, lon, radius, facilityFilter);
      },
      (geoErr) => {
        setLoading(false);
        setError(
          geoErr.code === 1
            ? "Location permission was denied. You can manually type your city name in the search box below."
            : "Could not retrieve your location. Check your network or device GPS."
        );
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Manual City Search via Nominatim
  const handleSearchCity = async (e) => {
    e.preventDefault();
    const q = cityInput.trim();
    if (!q) return;

    setLoading(true);
    setError("");

    const geo = await geocodeLocation(q);
    if (!geo) {
      setLoading(false);
      setError(`Could not find coordinates for "${q}". Please check the spelling or specify a state.`);
      return;
    }

    setCenter([geo.lat, geo.lon]);
    setLocationName(geo.displayName);
    await loadHospitals(geo.lat, geo.lon, radius, facilityFilter);
  };

  // Filter hospitals by name in client view
  const filteredHospitals = hospitals.filter((h) => {
    if (!nameFilter.trim()) return true;
    return (
      h.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      h.address.toLowerCase().includes(nameFilter.toLowerCase())
    );
  });

  return (
    <section className="feature-page">
      <div className="feature-page-heading">
        <span className="feature-heading-icon" style={{ color: "#008da5", background: "#def8fb" }}>
          <Hospital size={27} />
        </span>
        <div>
          <span className="section-kicker">REAL GEOSPATIAL DATA</span>
          <h1>{t("hospitals")}</h1>
          <p>Verified healthcare facilities, emergency clinics, and turn-by-turn directions via OpenStreetMap.</p>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="hospital-toolbar">
        {/* City Geocoding Form */}
        <form onSubmit={handleSearchCity} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder={t("searchCity")}
              style={{
                width: "100%",
                minHeight: "44px",
                padding: "8px 12px 8px 36px",
                border: "1px solid #dfe8f6",
                borderRadius: "11px",
                fontSize: "12px",
              }}
            />
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "14px", color: "#8298b7" }}
            />
          </div>
          <button className="button button-outline" type="submit" disabled={loading}>
            Search
          </button>
        </form>

        {/* Locate Me button */}
        <button
          className="button button-primary"
          type="button"
          onClick={handleLocateMe}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle size={16} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <MapPin size={16} />
          )}
          {t("locateMe")}
        </button>

        {/* Radius filter */}
        <div>
          <label htmlFor="radius-select">{t("radius")}</label>
          <select
            id="radius-select"
            value={radius}
            onChange={(e) => {
              const r = Number(e.target.value);
              setRadius(r);
              loadHospitals(center[0], center[1], r, facilityFilter);
            }}
          >
            <option value="2000">2 km</option>
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
            <option value="15000">15 km</option>
          </select>
        </div>

        {/* Type filter */}
        <div>
          <label htmlFor="facility-type">Facility Type</label>
          <select
            id="facility-type"
            value={facilityFilter}
            onChange={(e) => {
              const f = e.target.value;
              setFacilityFilter(f);
              loadHospitals(center[0], center[1], radius, f);
            }}
          >
            <option value="all">All Healthcare</option>
            <option value="hospital">Hospitals Only</option>
            <option value="clinic">Clinics & Doctors</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="status-message" style={{ marginBottom: "16px" }}>
          <AlertTriangle size={16} /> {error}
        </p>
      )}

      {/* Main Map & Result Cards Layout */}
      <div className="hospital-layout">
        {/* Interactive Leaflet Map */}
        <div className="map-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: "450px" }}>
            <LeafletMap
              center={center}
              zoom={radius > 8000 ? 12 : 14}
              userLocation={userLocation}
              hospitals={filteredHospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={(h) => setSelectedHospital(h)}
            />
          </div>
          <div
            style={{
              padding: "10px 14px",
              background: "#f9fbff",
              borderTop: "1px solid #e2eaf5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#6b82a2",
            }}
          >
            <span>
              📍 <strong>Searching around:</strong> {locationName.slice(0, 45)}...
            </span>
            <span>Data © OpenStreetMap contributors (ODbL)</span>
          </div>
        </div>

        {/* Synchronized Facilities List */}
        <div className="hospital-results">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ margin: 0 }}>
              Facilities Found <span>{filteredHospitals.length}</span>
            </h2>
            <div style={{ position: "relative", width: "160px" }}>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by name..."
                style={{
                  width: "100%",
                  padding: "5px 8px",
                  fontSize: "11px",
                  border: "1px solid #d5e2f3",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
            {filteredHospitals.length === 0 ? (
              <div className="empty-state">
                <Hospital size={30} />
                <strong>No Facilities Found</strong>
                <p>Try searching another city or expanding the radius up to 15 km.</p>
              </div>
            ) : (
              filteredHospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`;

                return (
                  <article
                    key={h.id}
                    className="hospital-item"
                    onClick={() => setSelectedHospital(h)}
                    style={{
                      cursor: "pointer",
                      padding: "12px",
                      borderRadius: "12px",
                      background: isSelected ? "#eef5ff" : "transparent",
                      border: isSelected ? "1px solid #a8caff" : "none",
                      marginBottom: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      className="feature-icon"
                      style={{
                        background: isSelected ? "#0866f5" : "#def8fb",
                        color: isSelected ? "white" : "#008da5",
                        width: "38px",
                        height: "38px",
                      }}
                    >
                      <Hospital size={19} />
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <strong style={{ color: isSelected ? "#0866f5" : "#142f59" }}>{h.name}</strong>
                        {h.emergency && (
                          <span
                            style={{
                              background: "#ffe8ed",
                              color: "#e63d58",
                              fontSize: "10px",
                              fontWeight: 800,
                              padding: "2px 6px",
                              borderRadius: "6px",
                            }}
                          >
                            24/7 Emergency
                          </span>
                        )}
                      </div>

                      <p style={{ margin: "4px 0", color: "#6880a2", fontSize: "11px" }}>{h.address}</p>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px", fontSize: "11px" }}>
                        <span style={{ color: "#0866f5", fontWeight: 700 }}>
                          {h.distance.toFixed(1)} km away
                        </span>
                        <span style={{ color: "#8c9fb8", textTransform: "capitalize" }}>{h.amenity}</span>
                        {h.phone && (
                          <a
                            href={`tel:${h.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#e63d58", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            <Phone size={11} /> {h.phone}
                          </a>
                        )}
                      </div>

                      <div style={{ marginTop: "8px" }}>
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "#0866f5",
                            fontWeight: 700,
                            fontSize: "11px",
                          }}
                        >
                          <Navigation size={13} /> {t("directions")} <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      <p className="safety-note">
        Hospital listings are retrieved in real-time from OpenStreetMap. Facility contact numbers, specialty beds, and
        availability may change. In critical emergencies, dial <strong>112</strong> immediately.
      </p>
    </section>
  );
}
