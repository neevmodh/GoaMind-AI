import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Leaf } from 'lucide-react';

// Centers map precisely to coordinates when active location changes
function MapRecenter({ activeLoc }) {
  const map = useMap();
  useEffect(() => {
    if (activeLoc) {
      map.flyTo([activeLoc.latitude, activeLoc.longitude], 13, { duration: 1.5 });
    }
  }, [activeLoc, map]);
  return null;
}

export default function MapView({ locations = [], activeLoc = null, onSelectActive }) {
  const center = { lat: 15.2993, lng: 74.1240 }; 

  const getMarkerIcon = (label, name) => {
    const colorMap = { 
      "low": "bg-emerald-500", 
      "moderate": "bg-amber-400", 
      "high": "bg-orange-500", 
      "very_high": "bg-rose-500 animate-pulse" 
    };
    
    return L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="relative w-5 h-5 rounded-full shadow-lg border-[3px] border-slate-900 ${colorMap[label] || "bg-blue-500"} transition-all z-20 group">
           <div class="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 font-bold text-slate-200 text-[11px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
             ${name}
           </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={10} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-3xl z-10"
        zoomControl={false}
      >
        {/* CartoDB Dark Matter Tile Layer - No API Key Needed! */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapRecenter activeLoc={activeLoc} />

        {locations.map(loc => (
          <Marker 
            key={loc.id} 
            position={[loc.latitude, loc.longitude]} 
            icon={getMarkerIcon(loc.crowd_label, loc.name)}
            eventHandlers={{
              click: () => onSelectActive && onSelectActive(loc)
            }}
          >
            {activeLoc?.id === loc.id && (
              <Popup className="custom-leaflet-popup">
                <div className="text-slate-100 p-1 min-w-[200px] flex flex-col gap-2">
                  <h3 className="font-extrabold text-base leading-tight">{loc.name}</h3>
                  <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                     <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{loc.category}</span>
                     <span className="bg-slate-700 px-1.5 py-0.5 border border-slate-600 rounded text-white">{loc.crowd_label.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-2 mt-1">
                     <span className="font-bold text-emerald-400">Eco: {loc.eco_score}/10 <Leaf size={10} className="inline mb-0.5"/></span>
                     {loc.score && <span className="font-bold text-goa-teal bg-goa-teal/10 border border-goa-teal/20 px-1.5 py-0.5 rounded">AI: {loc.score}%</span>}
                  </div>
                  <button className="mt-2 w-full bg-slate-800 hover:bg-goa-teal transition-colors text-white border border-slate-600 rounded-md py-1.5 font-bold text-xs uppercase tracking-wide cursor-pointer focus:outline-none">
                    View Complete Detail
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
