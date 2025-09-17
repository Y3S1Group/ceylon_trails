import { MapPin } from 'lucide-react';
import React from 'react'
import { useState } from 'react'

const LocationInput = ({ value, onChange }) => {
    const [locationSuggestion, setLocationSuggestion] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchLocations = async (query) => {
        if (query.length < 3) {
        setLocationSuggestion([]);
        return;
        }
        try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
            )}&limit=5&addressdetails=1&countrycodes=LK`
        );
        const data = await response.json();

        const suggestions = data.map((item) => {
            const { address } = item;
            const landmark =
            address.attraction ||
            address.tourism ||
            address.building ||
            address.neighbourhood ||
            item.display_name.split(",")[0];
            const town =
            address.city || address.town || address.village || address.hamlet || "";
            const province = address.state || "";
            const country = address.country || "";
            const display_name = [landmark, town, province, country]
            .filter(Boolean)
            .join(", ");
            return {
            display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            };
        });

        setLocationSuggestion(suggestions);
        setShowSuggestions(true);
        } catch (error) {
        console.error("Error fetching locations:", error);
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        // just update text while typing
        onChange({ location: val, coordinates: null });
        searchLocations(val);
    };

    const selectLocation = (suggestion) => {
        console.log('Selecting location:', suggestion);
        onChange({
        location: suggestion.display_name,
        coordinates: { lat: suggestion.lat, lon: suggestion.lon },
        });
        setShowSuggestions(false);
        setLocationSuggestion([]);
    };

    return (
        <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
                type="text"
                value={value || ""}
                onChange={handleChange}
                onFocus={() => value?.length >= 3 && setShowSuggestions(true)}
                placeholder="Type to search locations..."
                className="w-full pl-9 pr-3 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
            />
            {showSuggestions && locationSuggestion.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {locationSuggestion.map((s, idx) => (
                    <button
                    key={idx}
                    type="button"
                    onClick={() => selectLocation(s)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                    >
                    {s.display_name}
                    </button>
                ))}
                </div>
            )}
        </div>
    );
}

export default LocationInput