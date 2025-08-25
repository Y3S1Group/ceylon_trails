// import { loadGoogleMapsScript } from '../utils/loadGoogleMaps';

// useEffect(() => {
//   const initAutocomplete = async () => {
//     try {
//       const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//       const google = await loadGoogleMapsScript(apiKey);

//       if (locationInputRef.current) {
//         const autocomplete = new google.maps.places.Autocomplete(locationInputRef.current, {
//           types: ['geocode'],
//           componentRestrictions: { country: 'lk' },
//         });

//         autocomplete.addListener('place_changed', () => {
//           const place = autocomplete.getPlace();
//           setFormData(prev => ({ ...prev, location: place.formatted_address || '' }));
//         });
//       }
//     } catch (err) {
//       console.error('Error loading Google Maps', err);
//     }
//   };

//   initAutocomplete();
// }, []);

export const fetchOSMSuggestions = async (query) => {
  if (!query) return [];

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
  );
  const data = await response.json();

  // Return display names for autocomplete
  return data.map(place => place.display_name);
};
