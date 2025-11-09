import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { mockCities } from '../mocks/index.mock';

type Props = {
    onAnalyze?: (city: string) => Promise<AnalysisResult | void> | void;
    apiCitiesEndpoint?: string; // optional override for cities endpoint
};

const QueryPanel: React.FC<Props> = ({ onAnalyze, apiCitiesEndpoint }) => {
    const [query, setQuery] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingAnalyze, setLoadingAnalyze] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const citiesEndpoint = apiCitiesEndpoint || `${import.meta.env.VITE_API_URL || ''}/cities`;

    // load cities list (try API, fallback to mockCities)
    useEffect(() => {
        let mounted = true;
        setLoadingCities(true);
        fetch(citiesEndpoint, { method: 'GET' })
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to fetch cities');
                return (await res.json()) as string[];
            })
            .then((data) => {
                if (!mounted) return;
                setCities(Array.isArray(data) ? data : mockCities);
            })
            .catch(() => {
                // fallback to mock data
                setCities(mockCities);
            })
            .finally(() => mounted && setLoadingCities(false));

        return () => {
            mounted = false;
        };
    }, [citiesEndpoint]);

    // filter suggestions as user types
    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        const q = query.toLowerCase();
        const filtered = cities
            .filter((c) => c.toLowerCase().includes(q))
            .slice(0, 8);
        setSuggestions(filtered);
        setShowDropdown(filtered.length > 0);
    }, [query, cities]);

    // click outside to close dropdown
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target as Node)) setShowDropdown(false);
        }
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    const handleSelect = (city: string) => {
        setSelectedCity(city);
        setQuery(city);
        setShowDropdown(false);
        setError(null);
    };

    // Detect location using browser geolocation and reverse geocode using Nominatim
    const detectLocation = async () => {
        setError(null);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        setLoadingCities(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const resp = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                        { headers: { 'User-Agent': 'tmobile-dashboard' } }
                    );
                    if (!resp.ok) throw new Error('Reverse geocoding failed');
                    const data = await resp.json();
                    // attempt to read city/display_name
                    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name;
                    if (city) {
                        // try to match one of known cities
                        const match = cities.find((c) => c.toLowerCase().includes((city as string).toLowerCase())) || (city as string);
                        handleSelect(match);
                    } else {
                        setError('Could not determine city from coordinates');
                    }
                } catch (e) {
                    setError('Failed to reverse-geocode location');
                } finally {
                    setLoadingCities(false);
                }
            },
            (err) => {
                setLoadingCities(false);
                setError(err.message || 'Failed to get current position');
            },
            { enableHighAccuracy: false, timeout: 10000 }
        );
    };

    const validateCity = (city: string | null) => {
        if (!city) return false;
        const found = cities.find((c) => c.toLowerCase() === city.toLowerCase());
        return Boolean(found);
    };

    const runAnalyze = async () => {
        setError(null);
        if (!selectedCity) {
            setError('Please select a city before analyzing');
            return;
        }
        if (!validateCity(selectedCity)) {
            setError('Selected city is not valid. Please choose from suggestions.');
            return;
        }
        try {
            setLoadingAnalyze(true);
            await onAnalyze?.(selectedCity);
        } catch (e: any) {
            setError(e?.message || 'Analyze failed');
        } finally {
            setLoadingAnalyze(false);
        }
    };

    const canAnalyze = Boolean(selectedCity) && !loadingAnalyze;

    const renderedSuggestions = useMemo(() => {
        return suggestions.map((s) => (
            <li
                key={s}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(s)}
            >
                {s}
            </li>
        ));
    }, [suggestions]);

    return (
        <section className="bg-panel p-8 rounded-2xl shadow-2xl border-panel mb-8" ref={containerRef}>
            <div className="flex items-center gap-4 mb-4">
                <Search className="w-6 h-6 icon-pink" />
                <h2 className="text-xl font-bold">Analyze Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* City Input with Autocomplete */}
                <div className="md:col-span-7 relative">
                    <input
                        type="text"
                        placeholder={loadingCities ? 'Loading cities...' : 'Enter city (e.g., Richardson, TX)'}
                        className="input-dark w-full text-lg"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedCity(null);
                        }}
                        onFocus={() => setShowDropdown(suggestions.length > 0)}
                        aria-autocomplete="list"
                    />
                    {/* Autocomplete dropdown */}
                    {showDropdown && suggestions.length > 0 && (
                        <ul className="absolute top-full left-0 right-0 mt-2 bg-dark-gradient border border-panel rounded-xl shadow-2xl overflow-hidden z-50">
                            {suggestions.map((city, i) => (
                                <li key={city} className="px-6 py-3 hover:bg-panel cursor-pointer transition flex items-center gap-2" onClick={() => handleSelect(city)}>
                                    <MapPin className="inline w-4 h-4 mr-2 text-gray-500" />
                                    {city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detect Location Button */}
                <div className="md:col-span-2">
                    <button
                        type="button"
                        onClick={detectLocation}
                        className="w-full h-full px-6 py-4 bg-panel-header hover:bg-panel rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-panel"
                    >
                        <MapPin className="w-5 h-5" />
                        {loadingCities ? 'Detecting...' : 'Auto-Detect'}
                    </button>
                </div>

                {/* Analyze CTA */}
                <div className="md:col-span-3">
                    <button
                        type="button"
                        onClick={runAnalyze}
                        disabled={!canAnalyze}
                        className={`w-full h-full px-6 py-4 btn-gradient font-bold transition shadow-lg shadow-pink-500/30 text-lg ${!canAnalyze ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loadingAnalyze ? 'Analyzing...' : 'Analyze Happiness 🚀'}
                    </button>
                </div>
            </div>

            {error && <div className="text-sm text-red-400 mt-4">{error}</div>}
            {selectedCity && (
                <div className="text-sm text-gray-400 mt-2">Selected city: <strong>{selectedCity}</strong></div>
            )}
        </section>
    );
};

export default QueryPanel;
