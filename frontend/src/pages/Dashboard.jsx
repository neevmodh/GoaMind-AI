import { useState, useEffect, useMemo } from 'react';
import { getLocations, getLocation, getRecommended, getWeather } from '../api/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Cloud, Wind, Droplets, Sun, AlertCircle, Leaf, Sparkles, RefreshCcw, Bell, Activity, CheckCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [weather, setWeather] = useState(null);
  const [detailedLocations, setDetailedLocations] = useState([]);
  const [selectedLocId, setSelectedLocId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      const weatherRes = await getWeather();
      setWeather(weatherRes);
      const locsRes = await getLocations();
      setLocations(locsRes);
      const recsRes = await getRecommended();
      setRecommended(recsRes);

      const allDetailed = await Promise.all(locsRes.map(l => getLocation(l.id)));
      setDetailedLocations(allDetailed);
      
      if (allDetailed.length > 0 && !selectedLocId) setSelectedLocId(allDetailed[0].id);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const lowestCrowdRec = useMemo(() => recommended.length ? recommended.reduce((p, c) => (c.crowd_level < p.crowd_level ? c : p), recommended[0]) : null, [recommended]);
  const bestEcoChoice = useMemo(() => locations.length ? locations.reduce((p, c) => (c.eco_score > p.eco_score ? c : p), locations[0]) : null, [locations]);
  const aiPicksCount = useMemo(() => recommended.filter(r => r.score > 70).length, [recommended]);

  const pieData = useMemo(() => {
    const counts = {};
    locations.forEach(l => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [locations]);
  
  const PIE_COLORS = ['#4FB3CE', '#7ECEC4', '#F4A443', '#FF6B6B', '#E07B2A', '#2D6A4F'];

  const lineData = useMemo(() => {
    if (!selectedLocId || detailedLocations.length === 0) return [];
    const loc = detailedLocations.find(l => l.id === selectedLocId);
    if (!loc || !loc.crowd_patterns_today) return [];
    return loc.crowd_patterns_today.filter(p => p.hour >= 6 && p.hour <= 22).map(p => ({ hour: `${p.hour}:00`, crowd: p.crowd_level }));
  }, [selectedLocId, detailedLocations]);

  const heatmapHours = Array.from({ length: 17 }, (_, i) => i + 6);

  const getHeatmapColor = (level) => {
    if (level <= 3) return 'bg-[#7ECEC4]'; // Seafoam
    if (level <= 6) return 'bg-[#F4A443]'; // Sunset Gold
    if (level <= 8) return 'bg-[#E07B2A]'; // Deep Amber
    return 'bg-[#FF6B6B]';                 // Coral Glow
  };

  const generateLiveAlerts = () => {
    const alerts = [];
    if (weather?.description?.includes('rain')) alerts.push("Atmosphere warning: Expect delays. Seek indoor alternatives like Heritage spots.");
    const highestLoc = locations.reduce((prev, curr) => ((curr.crowd_level || 0) > (prev?.crowd_level || 0) ? curr : prev), null);
    if (highestLoc && highestLoc.crowd_level >= 8) alerts.push(`${highestLoc.name} is hitting critical capacity. Redirecting traffic.`);
    const lowestNature = locations.find(l => l.category === 'nature' && l.crowd_level <= 3);
    if (lowestNature) alerts.push(`Optimal conditions at ${lowestNature.name} right now. Minimal crowd interference.`);
    return alerts;
  };
  const liveAlerts = generateLiveAlerts();

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } };

  return (
    <div className="w-full space-y-6 pb-12 relative z-10">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
           <h1 className="text-4xl font-display font-extrabold tracking-tight text-white drop-shadow-md">Live Intelligence</h1>
           <p className="text-white/60 font-medium tracking-wide">Real-time predictive telemetry via GoaMind AI core.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[11px] text-sunset-gold font-bold bg-sunset-gold/10 px-3 py-1.5 rounded-lg border border-sunset-gold/20 backdrop-blur-sm">
             SYNCED: {lastRefreshed.toLocaleTimeString()}
           </span>
           <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border backdrop-blur-sm ${autoRefresh ? 'bg-seafoam/20 border-seafoam/40 text-seafoam' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}>
             {autoRefresh ? <Activity size={14} className="animate-pulse" /> : <Activity size={14} />} Auto-Sync
           </button>
           <button onClick={fetchDashboardData} className="p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl text-white border border-white/10 transition-all active:scale-95">
             <RefreshCcw size={16} />
           </button>
        </div>
      </motion.div>

      {/* TOP ROW STATS (3D) */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         
         <motion.div variants={itemVariants}>
           <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} className="h-full">
             <div className="glass-panel p-6 rounded-3xl h-full relative overflow-hidden group shadow-ocean border border-white/10">
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div><p className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-1">Atmosphere</p><h3 className="text-3xl font-display font-bold text-white shadow-sm">{weather?.temp || '--'}°C</h3></div>
                   <div className="w-12 h-12 rounded-2xl bg-seafoam/10 flex items-center justify-center border border-seafoam/20 group-hover:scale-110 transition-transform">
                      <Cloud className="text-seafoam" size={24} />
                   </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/70 font-bold relative z-10">
                   <span className="flex items-center gap-1.5"><Droplets size={14} className="text-seafoam"/> {weather?.humidity || '--'}%</span>
                   <span className="flex items-center gap-1.5"><Wind size={14} className="text-seafoam"/> {weather?.wind_speed || '--'}m/s</span>
                </div>
                <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity"><Sun size={140}/></div>
             </div>
           </Tilt>
         </motion.div>

         <motion.div variants={itemVariants}>
           <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} className="h-full">
             <div className="glass-panel p-6 rounded-3xl h-full relative overflow-hidden group shadow-ocean border border-white/10">
                <div className="flex justify-between items-start mb-4">
                   <div><p className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-1">Optimum Path</p><h3 className="text-xl font-display font-bold text-white truncate pr-2" title={lowestCrowdRec?.name}>{lowestCrowdRec?.name || 'Loading'}</h3></div>
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
                      <CheckCircle className="text-emerald-400" size={24} />
                   </div>
                </div>
                {lowestCrowdRec && (
                  <div className="flex items-center gap-2 text-xs font-bold bg-black/20 p-2 rounded-xl border border-white/5">
                    <span className={`w-2.5 h-2.5 rounded-full ${getHeatmapColor(lowestCrowdRec.crowd_level)} shadow-[0_0_8px_currentColor] animate-pulse`} /> 
                    <span className="uppercase tracking-widest text-white/80">{(lowestCrowdRec.current_crowd_label || '').replace("_", " ")}</span>
                  </div>
                )}
             </div>
           </Tilt>
         </motion.div>

         <motion.div variants={itemVariants}>
           <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} className="h-full">
             <div className="glass-panel p-6 rounded-3xl h-full relative overflow-hidden group shadow-ocean border border-white/10">
                <div className="flex justify-between items-start mb-4">
                   <div><p className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-1">Top Eco Match</p><h3 className="text-xl font-display font-bold text-white truncate pr-2" title={bestEcoChoice?.name}>{bestEcoChoice?.name || 'Loading'}</h3></div>
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
                      <Leaf className="text-emerald-400" size={24} />
                   </div>
                </div>
                {bestEcoChoice && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-400/20 w-fit">
                    Eco Rating: {bestEcoChoice.eco_score}/10
                  </div>
                )}
             </div>
           </Tilt>
         </motion.div>

         <motion.div variants={itemVariants}>
           <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} className="h-full">
             <div className="glass-panel p-6 rounded-3xl h-full relative overflow-hidden group shadow-ocean border border-white/10">
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div><p className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-1">AI Hotlist</p><h3 className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-gold drop-shadow">{aiPicksCount || '--'}</h3></div>
                   <div className="w-12 h-12 rounded-2xl bg-sunset-gold/10 flex items-center justify-center border border-sunset-gold/20 group-hover:scale-110 transition-transform">
                      <Sparkles className="text-sunset-gold" size={24} />
                   </div>
                </div>
                <div className="text-[11px] font-bold text-white/50 uppercase tracking-widest relative z-10">Locations scored &gt; 70% Match</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-sunset-gold/5 blur-[50px] rounded-full" />
             </div>
           </Tilt>
         </motion.div>
      </motion.div>

      {/* DASHBOARD CHARTS */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl lg:col-span-2 shadow-ocean border border-white/10 relative z-0">
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-3"><Activity size={18} className="text-coral-glow"/> Radar: Geographic Congestion</h3>
            <div className="h-[250px] min-h-[250px] w-full relative">
               <ResponsiveContainer width="99%" height={250}>
                 <BarChart data={locations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} tickLine={false} axisLine={false} />
                   <YAxis hide domain={[0, 10]} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'rgba(10,61,92,0.9)', borderColor: 'rgba(79,179,206,0.3)', borderRadius: '1rem', color: '#fff', backdropFilter: 'blur(10px)'}} formatter={(val) => [val, 'Intensity /10']} />
                   <Bar dataKey="crowd_level" radius={[6, 6, 0, 0]}>
                     {locations.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.crowd_level > 8 ? '#FF6B6B' : entry.crowd_level > 5 ? '#F4A443' : '#7ECEC4'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl shadow-ocean border border-white/10 relative z-0">
            <h3 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2 border-b border-white/10 pb-3"><PieChart size={18} className="text-seafoam"/> Matrix Distribution</h3>
            <div className="h-[250px] min-h-[250px] w-full flex justify-center relative translate-y-4">
               <ResponsiveContainer width="99%" height={250}>
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                   </Pie>
                   <Tooltip contentStyle={{backgroundColor: 'rgba(10,61,92,0.9)', borderColor: 'rgba(79,179,206,0.3)', borderRadius: '0.5rem', color: '#fff', backdropFilter: 'blur(10px)'}} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl lg:col-span-3 shadow-ocean border border-white/10 relative z-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/10 pb-3">
               <h3 className="text-lg font-display font-bold text-white flex items-center gap-2"><Wind size={18} className="text-ocean-light"/> Predictive Shift Trajectory</h3>
               <select 
                 value={selectedLocId || ''} onChange={e => setSelectedLocId(Number(e.target.value))}
                 className="bg-black/40 border border-white/10 text-sm font-bold text-white rounded-xl px-4 py-2 outline-none focus:border-sunset-gold backdrop-blur-md"
               >
                 {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
               </select>
            </div>
            
            <div className="h-[250px] min-h-[250px] w-full mt-4">
               <ResponsiveContainer width="99%" height={250}>
                 <LineChart data={lineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                   <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} />
                   <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} tickLine={false} axisLine={false} />
                   <Tooltip contentStyle={{backgroundColor: 'rgba(10,61,92,0.9)', borderColor: 'rgba(79,179,206,0.3)', borderRadius: '1rem', color: '#fff', backdropFilter: 'blur(10px)'}} formatter={(val) => [val, 'Density Level']} />
                   <Line type="monotone" dataKey="crowd" stroke="#F4A443" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#0A3D5C'}} activeDot={{ r: 8, stroke: '#7ECEC4' }} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

      </motion.div>

      {/* HEATMAP GRID & ALERTS */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl lg:col-span-1 shadow-ocean border border-white/10 flex flex-col gap-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-sunset-gold/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
           <h3 className="text-lg font-display font-bold text-white flex items-center gap-2"><Bell size={18} className="text-sunset-gold animate-[pulseGlow_3s_infinite]"/> Deep AI Sentinels</h3>
           <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 mt-2 relative z-10">
              <AnimatePresence>
                {liveAlerts.length > 0 ? liveAlerts.map((alert, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-black/30 border-l-2 border-sunset-gold p-3.5 rounded-xl text-xs font-bold tracking-wide text-white/80 shadow-sm backdrop-blur-sm">
                    {alert}
                  </motion.div>
                )) : (
                  <div className="text-xs text-white/40 font-bold uppercase tracking-widest p-4 bg-black/20 rounded-xl border border-white/5 text-center">No anomalies registered.</div>
                )}
              </AnimatePresence>
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl lg:col-span-3 shadow-ocean border border-white/10 overflow-hidden flex flex-col">
           <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-3"><Navigation size={18} className="text-seafoam"/> Real-Time Density Mesh</h3>
           
           <div className="overflow-x-auto hide-scroll flex-1 rounded-xl border border-white/5 bg-black/30 relative px-1 py-1 backdrop-blur-sm shadow-inner">
             <div className="min-w-fit">
               <div className="flex gap-1 mb-2 px-2 sticky top-0 bg-black/40 backdrop-blur-md z-20 pt-2 pb-1 border-b border-white/5">
                 <div className="w-48 shrink-0 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pl-2">Coordinate Track</div>
                 {heatmapHours.map(h => (
                   <div key={h} className="w-10 text-center text-[10px] font-black text-white/40 uppercase shrink-0">{h}h</div>
                 ))}
               </div>
               
               {detailedLocations.map((loc, i) => (
                 <motion.div key={loc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex gap-1 mb-1 items-center px-2 hover:bg-white/5 rounded-lg transition-colors py-1 group">
                   <div className="w-48 shrink-0 text-[13px] font-bold text-white/80 truncate pr-4 pl-2 drop-shadow-sm">{loc.name}</div>
                   {heatmapHours.map(hour => {
                     const pattern = loc.crowd_patterns_today?.find(p => p.hour === hour);
                     const level = pattern?.crowd_level || 0;
                     return (
                       <div 
                         key={hour} title={`${loc.name} at ${hour}:00 - Intensity ${level}/10`}
                         className={`w-10 h-8 rounded-md shrink-0 transition-all duration-300 ${getHeatmapColor(level)} opacity-70 group-hover:opacity-100 hover:scale-110 cursor-crosshair shadow-sm border border-black/20`}
                       ></div>
                     );
                   })}
                 </motion.div>
               ))}
               {detailedLocations.length === 0 && <div className="p-8 text-center text-sunset-gold w-full text-xs font-bold uppercase tracking-widest animate-pulse">Establishing Mesh Arrays...</div>}
             </div>
           </div>
        </motion.div>

      </motion.div>

    </div>
  );
}
