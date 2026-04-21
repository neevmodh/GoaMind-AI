import { Activity, Users, Thermometer } from 'lucide-react';

export default function LiveDashboard() {
  const stats = [
    { label: "Active Users", value: "342", icon: Users },
    { label: "Baga Beach Crowd", value: "High", icon: Activity },
    { label: "Current Temp", value: "29°C", icon: Thermometer },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="glass p-6 rounded-2xl border-t-2 border-t-goagreen-500 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Icon size={20} /> <span>{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}
