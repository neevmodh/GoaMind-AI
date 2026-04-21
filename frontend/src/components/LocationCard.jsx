import { MapPin, Info } from 'lucide-react';

export default function LocationCard({ location }) {
  return (
    <div className="glass p-5 rounded-2xl group hover:border-goagreen-500/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-white">{location.name}</h4>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-goagreen-400 border border-goagreen-500/20 uppercase tracking-wide">
          {location.type}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-4">{location.description}</p>
      <button className="flex items-center gap-2 text-sm text-goagreen-400 group-hover:text-goagreen-300 transition-colors">
        <MapPin size={16} /> View on map
      </button>
    </div>
  );
}
