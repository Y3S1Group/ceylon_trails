import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { X, Route, Clock, Car, Sun, CloudSun, MoonStar, CloudMoon, Cloud, CloudFog, CloudSunRain, CloudMoonRain, CloudLightning } from 'lucide-react';
import L, { icon } from 'leaflet';
import { distance } from 'framer-motion';
import CustomeZoom from './CustomeZoom';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

const RoutingControl = ({ userLocation, postLocation, onRouteFound }) => {
    const map = useMap();
    const [routeCoords, setRouteCoords] = useState([]);

    useEffect(() => {
        if (userLocation && postLocation) {
            getRoute();
        }
    }, [userLocation, postLocation]);

    const getRoute = async () => {
        try {
            const response = await fetch (`https://router.project-osrm.org/route/v1/driving/${userLocation.lon},${userLocation.lat};${postLocation.lon},${postLocation.lat}?overview=full&geometries=geojson&steps=true`);

            const data = await response.json();

            if (data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

                setRouteCoords(coordinates);

                if (coordinates.length > 0) {
                    const bounds = L.latLngBounds(coordinates);
                    map.fitBounds(bounds, { padding: [20, 20] });
                }

                if (onRouteFound) {
                    onRouteFound({
                        distance: route.distance / 1000,
                        duration: route.duration,
                        steps: route.legs[0]?.steps || []
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching route: ', error);
        }
    };

    return routeCoords.length > 0 ? (
        <Polyline
            positions={routeCoords}
            color='#059669'
            weight={4}
            opacity={0.9}
        />
    ) : null;
};

const weatherCodeMap = {
    0: { day: { label: "Sunny", icon: <Sun className='w-4 h-4 text-yellow-500' /> }, night: { label: "Clear Night", icon: <MoonStar className='w-4 h-4 text-gray-700' /> } },
    2: { day: { label: "Partly Cloudy", icon: <CloudSun className='w-4 h-4 text-gray-600' /> }, night: { label: "Partly Cloudy Night", icon: <CloudMoon className='w-4 h-4 text-gray-500' /> } },
    3: { day: { label: "Cloudy", icon: <Cloud className='w-4 h-4 text-gray-500' /> }, night: { label: "Cloudy Night", icon: <Cloud className='w-4 h-4 text-gray-400' /> } },
    45: { day: { label: "Foggy", icon: <CloudFog className='w-4 h-4 text-gray-400' /> }, night: { label: "Foggy Night", icon: <CloudFog className='w-4 h-4 text-gray-600' /> } },
    51: { day: { label: "Light Rain", icon: <CloudSunRain className='w-4 h-4 text-blue-500' /> }, night: { label: "Light Rain Night", icon: <CloudMoonRain className='w-4 h-4 text-blue-400' /> } },
    61: { day: { label: "Rain", icon: <CloudLightning className='w-4 h-4 text-blue-600' /> }, night: { label: "Rain Night", icon: <CloudLightning className='w-4 h-4 text-blue-500' /> } },
};

const getWeatherInfo = (weather) => {
    if (!weather) return null;
    const hour = new Date(weather.time).getHours();
    const iSDay = hour >= 6 && hour < 18;
    const temp = weather.temperature;
    const cold = temp < 18;
    const codeMap = weatherCodeMap[weather.weathercode];
    if (!codeMap) return null;
    const info = iSDay ? codeMap.day : codeMap.night;
    return {
        icon: info.icon,
        label: info.label,
        temperature: temp,
    };
};

const InteractiveMap = ({ isOpen, onClose, post, userLocation, setUserLocation }) => {
    const [routeInfo, setRouteInfo] = useState(null);
    const [showDirections, setShowDirections] = useState(false);
    const [weather, setWeather] = useState(null);
    const [requestingLocation, setRequestingLocation] = useState(false);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const postCoords = post?.coordinates
        ?   {
            lat: post.coordinates.coordinates[1],
            lon: post.coordinates.coordinates[0]
            }
        : null;

    const handleRouteToggle = () => {
        if (!showDirections && !userLocation) {
            setRequestingLocation(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const newLocation = {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                        setUserLocation(newLocation);
                        setShowDirections(true),
                        setRequestingLocation(false);
                    },
                    (error) => {
                        console.log('Location access denied:', error);
                        setRequestingLocation(false);
                        alert('Location access is required for directions. Please allow location access and try again.');
                    }
                );
            } else {
                setRequestingLocation(false);
                alert('Geolocation is not supported by this browser.');
            }
        } else {
            setShowDirections(!showDirections);
        }
    }
    
    useEffect(() => {
        if (postCoords?.lat && postCoords?.lon) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${postCoords.lat}&longitude=${postCoords.lon}&current_weather=true`)
            .then(res => res.json())
            .then(data => {
            if (data.current_weather) {
                setWeather(data.current_weather);
            }
            })
            .catch(err => console.error("Weather fetch error:", err));
        }
    }, [postCoords?.lat, postCoords?.lon]);

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
        setShowDirections(false);
        setRouteInfo(null);
        setRequestingLocation(false);
        }
    }, [isOpen]);

    if (!isOpen || !post?.coordinates) return null;

    const weatherInfo = getWeatherInfo(weather);

    const directDistance = userLocation ? 
        calculateDistance(userLocation.lat, userLocation.lon, postCoords.lat, postCoords.lon) : null;
    
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return hrs > 0 ? `${hrs} hr ${remainingMins} min` : `${mins} min`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-80 flex items-center justify-center">
            <div className="relative max-w-5xl max-h-screen p-4 w-full">

                {/* Close Button */}
                <button
                onClick={onClose}
                className="absolute top-0 right-0 z-10 p-2 -m-3 bg-white bg-opacity-50 rounded-full hover:bg-teal-500 hover:bg-opacity-70 transition-colors"
                >
                <X className="w-5 h-5 text-black hover:text-white" />
                </button>

                {/* Map Container */}
                <div className="relative bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl overflow-hidden" style={{ height: '85vh' }}>
                
                {/* Info Header - Fixed position */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/95 to-transparent p-6">
                    <div className="text-white">
                    <h3 className="font-semibold text-lg mb-2">{post.location}</h3>
                    </div>
                </div>

                {/* Route Toggle Button - Inside map, bottom right */}
                <div className="absolute bottom-36 right-4 z-20 group">
                    <button
                        onClick={handleRouteToggle}
                        disabled={requestingLocation}
                        className={`p-3 rounded-full shadow-lg transition-all ${
                            showDirections 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-white text-gray-700 hover:bg-teal-500 hover:text-white'
                        } ${requestingLocation ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                    {requestingLocation ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Route className="w-5 h-5" />
                    )}
                    </button>
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 
                        bg-black text-white text-xs px-2 py-1 rounded 
                        opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {requestingLocation ? 'Getting location...' : (showDirections ? 'Hide directions' : 'Show directions')}
                    </span>
                </div>

                {/* Map */}
                <MapContainer 
                    center={[postCoords.lat, postCoords.lon]} 
                    zoom={userLocation ? 10 : 13}
                    zoomControl={false} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                    attribution="Google Maps"
                    url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                />
                    
                    {/* Post location marker */}
                    <Marker position={[postCoords.lat, postCoords.lon]}>
                    <Popup maxWidth={250} className="custom-popup">
                        <div>
                        {/*<img 
                            src={post.imageUrls[0]} 
                            alt="Post" 
                            className="w-full h-28 object-cover rounded-lg mb-3"
                        />*/}
                        <p className="font-medium text-md mb-1">{post.location}</p>
                        {/*<p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {post.caption}
                        </p>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">
                                #{tag}
                                </span>
                            ))}
                            </div>
                        )}*/}
                        </div>
                    </Popup>
                    </Marker>

                    {/* User location marker */}
                    {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lon]}>
                        <Popup>
                        <div className="text-center p-2">
                            <p className="font-medium">Your Location</p>
                            <p className="text-xs text-gray-600">Current position</p>
                        </div>
                        </Popup>
                    </Marker>
                    )}

                    {/* Routing */}
                    {showDirections && userLocation && (
                    <RoutingControl
                        userLocation={userLocation}
                        postLocation={postCoords}
                        onRouteFound={setRouteInfo}
                    />
                    )}
                    <CustomeZoom/>
                </MapContainer>

                <div className="absolute top-3/4 left-4 z-20 flex flex-col gap-3">
                    {routeInfo && (
                    <>
                        <div className="flex items-center gap-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                        <Car className="w-4 h-4" />
                        {routeInfo.distance.toFixed(1)} km
                        </div>
                        <div className="flex items-center gap-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                        <Clock className="w-4 h-4" />
                        {formatDuration(routeInfo.duration)}
                        </div>
                    </>
                    )}

                    {weatherInfo && (
                    <div className="flex items-center gap-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                        {weatherInfo.icon}
                        <span>{weatherInfo.temperature}°C</span>
                        <span>{weatherInfo.label}</span>
                    </div>
                    )}
                </div>

                {/*{(directDistance || routeInfo) && (
                    <div className="absolute top-3/4 left-4 z-20 flex flex-col gap-3">
                    {directDistance && (
                        <div className="flex items-center gap-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                        <RouteIcon className="w-4 h-4" />
                        {directDistance.toFixed(1)} km
                        </div>
                    )}

                    {routeInfo && (
                        <>
                        <div className="flex items-center gap-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                            <Car className="w-4 h-4" />
                            {routeInfo.distance.toFixed(1)} km
                        </div>
                        <div className="flex items-center gap-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                            <Clock className="w-4 h-4" />
                            {formatDuration(routeInfo.duration)}
                        </div>
                        </>
                    )}
                    </div>
                )}*/}

                {/* Route Status Indicator */}
                {showDirections && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                        {routeInfo ? 'Route calculated' : 'Calculating route...'}
                    </span>
                    </div>
                )}
                </div>
                

                {/* External Navigation Options - Bottom overlay 
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <button 
                    onClick={() => window.open(`https://www.google.com/maps/place/${postCoords.lat},${postCoords.lon}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-50 backdrop-blur-sm rounded-full hover:bg-teal-500 hover:bg-opacity-70 hover:text-white transition-colors text-sm font-medium"
                >
                    <MapPin className="w-4 h-4" />
                    Google Maps
                </button>
                
                {userLocation && (
                    <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lon}/${postCoords.lat},${postCoords.lon}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 bg-opacity-70 backdrop-blur-sm text-white rounded-full hover:bg-teal-600 hover:bg-opacity-80 transition-colors text-sm font-medium"
                    >
                    <Navigation className="w-4 h-4" />
                    Navigate
                    </button>
                )}
                </div>*/}
            </div>
        </div>
    );
}

export default InteractiveMap