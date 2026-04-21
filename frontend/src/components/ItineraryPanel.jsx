import { MapPin, Clock } from 'lucide-react';

export default function ItineraryPanel({ days }) {
  if (!days || days.length === 0) return <div className="glass p-6 text-center text-slate-400">Generate an itinerary first.</div>

  return (
    <div className="space-y-6">
      {days.map((dayPlan, idx) => (
        <div key={idx} className="glass p-6 rounded-2xl animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
          <h3 className="text-xl font-bold text-goagreen-400 mb-4 flex items-center gap-2">
            <Clock className="text-goagreen-500" /> Day {dayPlan.day}
          </h3>
          <ul className="space-y-3 pl-2">
            {dayPlan.activities.map((activity, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-goagreen-500 flex-shrink-0" />
                <span className="text-slate-300">{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
