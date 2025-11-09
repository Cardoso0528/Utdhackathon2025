import React, { useState } from 'react';
import { Filter, FileText, TrendingDown, Signal, Users, AlertTriangle, X, Download, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationSummaryHeader from './components/LocationSummaryHeader';
import NetworkHealthPanel from './components/NetworkHealth';
import KeyDriversPanel from './components/KeyDrivers';
import CompetitorComparisonPanel from './components/CompetitorComparison';
import TrendTimeline from './components/TrendTimeline';
import { mockAnalysisResult } from './mocks/index.mock';
import './App.css';

// Hotspot data with real coordinates
const hotspots = [
  { id: 1, lat: 32.7767, lng: -96.7970, city: 'Dallas, TX', severity: 'critical', provider: 'tmobile', outageCount: 847, chi: 62.3, duration: '2h 34m' },
  { id: 2, lat: 30.2672, lng: -97.7431, city: 'Austin, TX', severity: 'warning', provider: 'tmobile', outageCount: 342, chi: 74.1, duration: '1h 12m' },
  { id: 3, lat: 29.7604, lng: -95.3698, city: 'Houston, TX', severity: 'critical', provider: 'verizon', outageCount: 1243, chi: 58.7, duration: '3h 45m' },
  { id: 4, lat: 33.4484, lng: -112.0740, city: 'Phoenix, AZ', severity: 'warning', provider: 'att', outageCount: 456, chi: 71.2, duration: '0h 48m' },
  { id: 5, lat: 34.0522, lng: -118.2437, city: 'Los Angeles, CA', severity: 'moderate', provider: 'tmobile', outageCount: 234, chi: 78.9, duration: '0h 23m' },
  { id: 6, lat: 40.7128, lng: -74.0060, city: 'New York, NY', severity: 'critical', provider: 'verizon', outageCount: 1892, chi: 54.2, duration: '4h 12m' },
  { id: 7, lat: 41.8781, lng: -87.6298, city: 'Chicago, IL', severity: 'warning', provider: 'tmobile', outageCount: 567, chi: 69.8, duration: '1h 56m' },
  { id: 8, lat: 37.7749, lng: -122.4194, city: 'San Francisco, CA', severity: 'moderate', provider: 'att', outageCount: 289, chi: 81.3, duration: '0h 34m' },
  { id: 9, lat: 47.6062, lng: -122.3321, city: 'Seattle, WA', severity: 'warning', provider: 'tmobile', outageCount: 423, chi: 72.5, duration: '1h 28m' },
  { id: 10, lat: 25.7617, lng: -80.1918, city: 'Miami, FL', severity: 'moderate', provider: 'verizon', outageCount: 312, chi: 76.4, duration: '0h 41m' },
];

const providers = [
  { id: 'all', name: 'All', color: '#6b7280' },
  { id: 'tmobile', name: 'T-Mobile', color: '#E20074' },
  { id: 'verizon', name: 'Verizon', color: '#CD040B' },
  { id: 'att', name: 'AT&T', color: '#00A8E1' },
];

// map container style is applied inline on MapContainer (full-bleed)

const center = {
  lat: 39.8283,
  lng: -98.5795, // Center of USA
};

// mapOptions removed (Google Maps specific) — Leaflet uses TileLayer + CSS for styling

function App() {
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<any>(null);
  const [analysis] = useState(mockAnalysisResult);

  // small helper component to attach map click handler
  const MapClickHandler: React.FC<{ onMapClick: (latlng: { lat: number; lng: number }) => void }> = ({ onMapClick }) => {
    useMapEvents({
      click(e: any) {
        const latlng = e.latlng as any;
        onMapClick({ lat: latlng.lat, lng: latlng.lng });
      },
    });
    return null;
  };

  const filteredHotspots = selectedProvider === 'all'
    ? hotspots
    : hotspots.filter(h => h.provider === selectedProvider);

  // Marker icon styling handled via Leaflet CircleMarker in the map render

  // Update analysis with selected hotspot data
  const getAnalysisForHotspot = (hotspot: any) => {
    return {
      ...analysis,
      location: {
        ...analysis.location,
        city: hotspot.city,
      },
      chiScore: hotspot.chi,
    };
  };

  // Generate a simple JSON report for the selected target and trigger download
  const generateReport = () => {
    if (!reportTarget) return;
    const payload: any = { generatedAt: new Date().toISOString(), target: reportTarget };
    if (reportTarget.city) {
      payload.analysis = getAnalysisForHotspot(reportTarget);
    } else if (reportTarget.type === 'point') {
      payload.analysis = { note: 'Point selection - no hotspot analysis', coords: reportTarget.coords };
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowReportModal(false);
  };

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 dashboard-header">
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-pink-600 font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Network Outage Command Center</h1>
              <p className="text-sm text-pink-100">Live monitoring • United States</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-300">Live</span>
            </div>

            {/* Generate Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="btn-gradient px-6 py-2 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Provider Filter - Floating Top Center */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {providers.map(provider => (
          <button
            key={provider.id}
            onClick={() => setSelectedProvider(provider.id)}
            className={`px-6 py-3 rounded-2xl font-bold transition backdrop-blur-xl border-2 ${selectedProvider === provider.id
              ? 'bg-white/20 border-white/40 text-white shadow-2xl'
              : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700/80'
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: provider.color }}
              ></div>
              <span>{provider.name}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {provider.id === 'all' ? hotspots.length : hotspots.filter(h => h.provider === provider.id).length}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Stats Cards - Top Right */}
      <div className="absolute top-24 right-8 z-20 grid grid-cols-3 gap-3">
        <div className="dashboard-card p-4 min-w-[120px]">
          <div className="text-4xl font-bold text-red-400">{filteredHotspots.filter(h => h.severity === 'critical').length}</div>
          <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Critical</div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="dashboard-card p-4 min-w-[120px]">
          <div className="text-4xl font-bold text-orange-400">{filteredHotspots.filter(h => h.severity === 'warning').length}</div>
          <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Warning</div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="dashboard-card p-4 min-w-[120px]">
          <div className="text-4xl font-bold text-yellow-400">{filteredHotspots.filter(h => h.severity === 'moderate').length}</div>
          <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">Moderate</div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-8 left-8 z-20 dashboard-card p-5">
        <h3 className="font-bold mb-3 text-sm uppercase text-gray-400">Severity Levels</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <div className="text-sm font-semibold">Critical</div>
              <div className="text-xs text-gray-400">500+ reports</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
            <div>
              <div className="text-sm font-semibold">Warning</div>
              <div className="text-xs text-gray-400">300-500 reports</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
            <div>
              <div className="text-sm font-semibold">Moderate</div>
              <div className="text-xs text-gray-400">&lt;300 reports</div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Affected - Bottom Right */}
      <div className="absolute bottom-8 right-8 z-20 dashboard-gradient p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-white" />
          <div>
            <div className="text-3xl font-bold text-white">
              ~{Math.floor(filteredHotspots.reduce((sum, h) => sum + h.outageCount, 0) * 2.3 / 1000)}K
            </div>
            <div className="text-sm text-pink-100">Affected Customers</div>
          </div>
        </div>
      </div>

      {/* Map - using Leaflet + OpenStreetMap (no API key required) */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* @ts-ignore - casting react-leaflet props to any for compatibility with project types */}
        <MapContainer {...({ center: [center.lat, center.lng], zoom: 4, zoomControl: false, style: { width: '100%', height: '100vh' } } as any)}>
          {/* @ts-ignore */}
          {/* Fallback to OpenStreetMap tiles for reliability; switch back to Carto/Mapbox if you prefer */}
          <TileLayer {...({ attribution: '&copy; OpenStreetMap contributors', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)} />

          {filteredHotspots.map((hotspot) => {
            const colors: Record<string, string> = {
              critical: '#ef4444',
              warning: '#f59e0b',
              moderate: '#eab308',
            };
            const color = colors[hotspot.severity as keyof typeof colors] || '#94a3b8';
            // Make markers more visible at world zoom levels; reduce later if needed
            const radius = hotspot.severity === 'critical' ? 16 : 12;

            return (
              <CircleMarker {...({
                key: hotspot.id,
                center: [hotspot.lat, hotspot.lng],
                pathOptions: { color, fillColor: color, fillOpacity: 0.9, weight: 2 },
                radius,
                eventHandlers: {
                  click: () => setSelectedHotspot(hotspot),
                },
              } as any)}>
                {/* Popup shown on click */}
                {/* @ts-ignore */}
                <Popup {...({ offset: [0, -10] } as any)}>
                  <div className="bg-gray-800 p-3 rounded-lg text-white min-w-[180px]">
                    <div className="font-bold text-base mb-1">{hotspot.city}</div>
                    <div className="text-xs text-gray-400 mb-2">{hotspot.provider.toUpperCase()}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reports:</span>
                        <span className="font-bold">{hotspot.outageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">CHI Score:</span>
                        <span className="font-bold text-red-400">{hotspot.chi}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-center text-pink-400 font-semibold">
                      <button
                        className="w-full px-3 py-2 btn-gradient rounded-lg text-sm"
                        onClick={() => {
                          setReportTarget(hotspot);
                          setSelectedHotspot(hotspot);
                          setShowReportModal(true);
                        }}
                      >
                        Generate Report for this area
                      </button>
                    </div>
                  </div>
                </Popup>

                {/* Tooltip on hover */}
                {/* @ts-ignore */}
                <Tooltip {...({ direction: 'top', offset: [0, -10], opacity: 1 } as any)}>
                  <div className="text-sm">
                    <div className="font-semibold">{hotspot.city}</div>
                    <div className="text-xs text-gray-400">{hotspot.provider.toUpperCase()}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
          {/* map click handler to select arbitrary point */}
          <MapClickHandler onMapClick={(latlng) => {
            setReportTarget({ type: 'point', coords: latlng });
            setSelectedHotspot(null);
            setShowReportModal(true);
          }} />
        </MapContainer>
      </div>

      {/* Floating Metrics Panel - Slides in from right */}
      {selectedHotspot && (
        <div className="absolute top-0 right-0 bottom-0 w-[500px] dashboard-panel overflow-y-auto z-40 animate-slide-in">
          {/* Panel Header */}
          <div className="sticky top-0 dashboard-gradient p-6 z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{selectedHotspot.city}</h2>
                <div className="flex items-center gap-3 text-sm text-pink-100">
                  <span>📍 {selectedHotspot.provider.toUpperCase()}</span>
                  <span>•</span>
                  <span>⏱️ {selectedHotspot.duration}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{selectedHotspot.outageCount}</div>
                <div className="text-xs text-pink-100">Active Reports</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">~{Math.floor(selectedHotspot.outageCount * 2.3)}K</div>
                <div className="text-xs text-pink-100">Affected Users</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Location Summary with CHI */}
            <div className="dashboard-card p-5">
              <LocationSummaryHeader
                location={getAnalysisForHotspot(selectedHotspot).location}
                chiScore={selectedHotspot.chi}
              />
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <div className="text-red-300 text-sm font-semibold">
                  ⚠️ {(84.2 - selectedHotspot.chi).toFixed(1)} point drop from baseline (84.2)
                </div>
              </div>
            </div>

            {/* Network Health */}
            <div className="dashboard-card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Signal className="w-5 h-5 icon-blue" />
                Network Status
              </h3>
              <NetworkHealthPanel metrics={analysis.networkHealth} />
            </div>

            {/* Competitor Comparison - Compact */}
            <div className="dashboard-card p-5">
              <h3 className="font-bold mb-4">Provider Comparison</h3>
              <CompetitorComparisonPanel
                competitors={analysis.competitors}
                tmobileData={analysis.competitors[0]}
              />
            </div>

            {/* Trend Timeline - Compact */}
            <div className="dashboard-card p-5">
              <h3 className="font-bold mb-4">24-Hour Trend</h3>
              <TrendTimeline
                data={analysis.trendData}
                currentScore={selectedHotspot.chi}
              />
            </div>

            {/* Key Drivers */}
            <div className="dashboard-card p-5">
              <h3 className="font-bold mb-4">Impact Drivers</h3>
              <KeyDriversPanel drivers={analysis.keyDrivers} />
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-500/40 rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm">
                  🤖
                </div>
                AI Recommendations
              </h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg p-3 text-left transition">
                  <div className="font-semibold text-sm mb-1">Deploy Network Team</div>
                  <div className="text-xs text-gray-400">Emergency dispatch to {selectedHotspot.city}</div>
                </button>
                <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg p-3 text-left transition">
                  <div className="font-semibold text-sm mb-1">Customer Notification</div>
                  <div className="text-xs text-gray-400">SMS to ~{Math.floor(selectedHotspot.outageCount * 2.3)}K customers</div>
                </button>
                <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg p-3 text-left transition">
                  <div className="font-semibold text-sm mb-1">Bill Credit Offer</div>
                  <div className="text-xs text-gray-400">$25 credit for affected users</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="dashboard-card p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Generate Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportTarget && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                {reportTarget.city ? (
                  <div>
                    <div className="text-sm text-gray-300">Hotspot</div>
                    <div className="font-semibold">{reportTarget.city} — {reportTarget.provider?.toUpperCase?.()}</div>
                    <div className="text-xs text-gray-400">Reports: {reportTarget.outageCount} • CHI: {reportTarget.chi}</div>
                  </div>
                ) : reportTarget.type === 'point' ? (
                  <div>
                    <div className="text-sm text-gray-300">Selected Point</div>
                    <div className="font-semibold">Lat: {reportTarget.coords.lat.toFixed(4)}, Lon: {reportTarget.coords.lng.toFixed(4)}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-300">Selected area</div>
                )}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Report Type</label>
                <select className="input-dark w-full">
                  <option>Executive Summary</option>
                  <option>Detailed Analysis</option>
                  <option>Technical Report</option>
                  <option>Customer Impact Report</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Time Range</label>
                <select className="input-dark w-full">
                  <option>Last Hour</option>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-pink-600 border-2 border-pink-500 rounded-xl px-4 py-2 font-semibold hover:bg-pink-700 transition">PDF</button>
                  <button className="bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-2 hover:bg-gray-600 transition">Excel</button>
                  <button className="bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-2 hover:bg-gray-600 transition">CSV</button>
                </div>
              </div>
            </div>

            <button onClick={generateReport} className="btn-gradient w-full rounded-xl px-6 py-4 font-bold transition flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Generate & Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
