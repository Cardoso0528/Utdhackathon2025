import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import type { Hotspot } from '@/types';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

interface CoverageMapProps {
  hotspots: Hotspot[];
  onHotspotClick: (hotspot: Hotspot) => void;
  onMapClick: (coords: { lat: number; lng: number }) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'moderate': return '#22c55e';
    default: return '#6b7280';
  }
};

export default function CoverageMap({ hotspots, onHotspotClick, onMapClick }: CoverageMapProps) {
  const center: [number, number] = [39.8283, -98.5795];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapClickHandler onMapClick={onMapClick} />
      {hotspots.map((hotspot) => {
        const position: [number, number] = [hotspot.lat, hotspot.lng];
        const radiusSize = hotspot.severity === 'critical' ? 16 : hotspot.severity === 'warning' ? 12 : 8;
        const fillColor = getSeverityColor(hotspot.severity);

        return (
          <CircleMarker
            key={hotspot.id}
            center={position}
            pathOptions={{
              fillColor: fillColor,
              color: "#ffffff",
              weight: 2,
              opacity: 0.9,
              fillOpacity: 0.7,
            }}
            radius={radiusSize}
            eventHandlers={{
              click: () => onHotspotClick(hotspot),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-xs font-semibold">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3" />
                  {hotspot.city}
                </div>
                <div className="text-foreground/80">Outages: {hotspot.outageCount}</div>
                <div className="text-foreground/80">CHI: {hotspot.chi}</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm mb-2">{hotspot.city}</h3>
                <p className="text-xs mb-1">Provider: {hotspot.provider.toUpperCase()}</p>
                <p className="text-xs mb-1">Outages: {hotspot.outageCount}</p>
                <p className="text-xs mb-1">CHI Score: {hotspot.chi}</p>
                <p className="text-xs">Duration: {hotspot.duration}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
