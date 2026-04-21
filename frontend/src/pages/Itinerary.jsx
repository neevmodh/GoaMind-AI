import { useState, useEffect } from 'react';
import api, { generateItinerary } from '../api/client';
import { Calendar, Share2, Printer, Minus, Plus, Sparkles, Loader2, MapPin, RefreshCcw, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function Itinerary() {
  const [templates, setTemplates] = useState([]);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('medium');
  const [preferences, setPreferences] = useState(['Beach', 'Food']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  const ALL_PREFS = ['Beach', 'Heritage', 'Nature', 'Nightlife', 'Adventure', 'Food', 'Photography', 'Relaxation'];

  useEffect(() => {
    api.get('/api/itinerary/templates').then(res => setTemplates(res.data)).catch(console.error);
  }, []);

  const togglePref = (p) => {
    setPreferences(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const applyTemplate = (t) => {
    setDays(t.days);
    setBudget(t.budget);
    setPreferences(t.preferences.map(p => p.charAt(0).toUpperCase() + p.slice(1)));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setItinerary(null);
    try {
      const data = await generateItinerary({ days, budget, preferences, start_date: startDate });
      const expanded = {};
      Object.keys(data).forEach(day => expanded[day] = true);
      setExpandedDays(expanded);
      setItinerary(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate itinerary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDay = (day) => setExpandedDays(prev => ({...prev, [day]: !prev[day]}));

  const handleShare = () => {
    if (!itinerary) return;
    let text = `🌴 My GoaMind ${days}-Day AI Trip Plan:\n\n`;
    Object.keys(itinerary).forEach((dayKey, idx) => {
      text += `--- Day ${idx + 1} ---\n`;
      if(Array.isArray(itinerary[dayKey])) {
        itinerary[dayKey].forEach(act => {
          text += `📍 ${act.time} - ${act.activity} at ${act.location}\n`;
        });
      }
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-140px)] print:block pb-10 relative z-10"
    >
      {/* LEFT PANEL - BUILDER */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-1/3 space-y-6 print:hidden shrink-0">
        
        {/* Templates */}
        <div className="glass-panel p-6 rounded-3xl relative border border-white/10 shadow-ocean">
          <div className="flex items-center gap-2 mb-4 text-white font-display font-bold border-b border-white/10 pb-3">
             <Sparkles className="text-sunset-gold" size={20} /> AI Quick Templates
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.length > 0 ? templates.map(t => (
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                key={t.name} onClick={() => applyTemplate(t)} 
                className="bg-white/5 hover:bg-sunset-gold hover:text-night-sky border border-white/10 text-white/70 text-[11px] font-bold px-3 py-2 rounded-xl transition-all"
              >
                {t.name}
              </motion.button>
            )) : <div className="text-xs text-white/40 italic">Loading templates...</div>}
          </div>
        </div>

        {/* Form Controls */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/10 shadow-ocean">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Duration (Days)</label>
            <div className="flex items-center justify-between bg-black/30 border border-white/10 rounded-xl p-2 shadow-inner">
               <button onClick={() => setDays(Math.max(1, days-1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"><Minus size={18}/></button>
               <span className="font-display font-black text-2xl text-sunset-gold">{days}</span>
               <button onClick={() => setDays(Math.min(14, days+1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"><Plus size={18}/></button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Budget Level</label>
            <div className="flex bg-black/30 p-1 rounded-xl border border-white/10 shadow-inner">
               {['low', 'medium', 'high'].map(b => (
                 <button key={b} onClick={() => setBudget(b)} className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${budget === b ? 'bg-sunset-gold text-night-sky shadow-gold' : 'text-white/40 hover:text-white'}`}>
                   {b}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Preferences</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PREFS.map(p => (
                <button key={p} onClick={() => togglePref(p)} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${preferences.includes(p) ? 'bg-seafoam/20 border-seafoam text-seafoam shadow-[0_0_15px_rgba(126,206,196,0.2)]' : 'bg-black/30 border-white/10 text-white/40 hover:border-white/30'}`}>
                   {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black/30 border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-sunset-gold shadow-inner" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleGenerate} disabled={isGenerating} 
            className="w-full btn-gold py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
          >
             {isGenerating ? <><Loader2 className="animate-spin" size={20}/> Synchronizing...</> : <><Sparkles size={20}/> Generate AI Path</>}
          </motion.button>
        </div>

      </motion.div>

      {/* RIGHT PANEL - DISPLAY */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-2/3 glass-panel p-6 lg:p-10 rounded-3xl relative overflow-hidden shadow-ocean border border-white/10 min-h-[500px]">
        
        <AnimatePresence mode="wait">
          {!itinerary && !isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center py-24">
               <Calendar size={80} className="text-white/20 mb-6 mx-auto" />
               <h2 className="text-3xl font-display font-bold text-white mb-2">Unmapped Future</h2>
               <p className="text-white/40 text-sm max-w-sm font-medium">Define your parameters on the left to initialize the AI pathfinding engine.</p>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center py-32">
              <div className="w-20 h-20 rounded-full bg-sunset-gold/10 flex items-center justify-center mb-8 border border-sunset-gold/20 shadow-gold">
                 <Sparkles className="text-sunset-gold animate-spin" size={40} />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Orchestrating Matrix...</h2>
              <p className="text-xs text-white/40 font-black uppercase tracking-[0.3em] animate-pulse">Resolving Temporal Coordinates</p>
            </motion.div>
          )}

          {itinerary && !isGenerating && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }} className="relative z-20">
               {/* Header Tools */}
               <div className="flex flex-wrap justify-between items-end mb-10 pb-8 border-b border-white/10 print:border-slate-300">
                  <div>
                     <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white drop-shadow-md">
                       Goa <span className="text-sunset-gold italic">Expedition</span>
                     </h1>
                     <p className="text-seafoam mt-3 font-bold text-sm tracking-wider uppercase">{days} Days • {budget} Matrix • {startDate}</p>
                  </div>
                  <div className="flex gap-2 mt-6 print:hidden">
                     <button onClick={handleShare} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10 backdrop-blur-md">
                       {copied ? <Check className="text-emerald-400" size={20}/> : <Share2 size={20}/>}
                     </button>
                     <button onClick={() => window.print()} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10 backdrop-blur-md">
                       <Printer size={20}/>
                     </button>
                     <button onClick={handleGenerate} className="p-3 bg-sunset-gold/10 hover:bg-sunset-gold/20 rounded-xl text-sunset-gold transition-all border border-sunset-gold/30 backdrop-blur-md">
                       <RefreshCcw size={20}/>
                     </button>
                  </div>
               </div>

               {/* Days Rendering Block */}
               <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
                  {Object.keys(itinerary).map((dayKey, index) => {
                    const activities = itinerary[dayKey];
                    if(!Array.isArray(activities)) return null;

                    return (
                      <motion.div key={dayKey} variants={itemVariants} className="bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-lg group">
                        <button 
                          onClick={() => toggleDay(dayKey)}
                          className="w-full flex justify-between items-center p-6 bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <h3 className="text-2xl font-display font-bold flex items-center gap-4 text-white">
                             <span className="w-10 h-10 rounded-full bg-sunset-gold text-night-sky flex items-center justify-center text-lg font-black shadow-gold">{index + 1}</span>
                             Day {index + 1}
                          </h3>
                          <motion.div animate={{ rotate: expandedDays[dayKey] ? 180 : 0 }}>
                            <ChevronDown size={24} className="text-white/40 group-hover:text-white transition-colors" />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence>
                          {expandedDays[dayKey] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: "auto", opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                               <div className="p-8 relative">
                                  <div className="absolute left-[39px] top-10 bottom-10 w-px bg-gradient-to-b from-sunset-gold/50 via-seafoam/50 to-transparent"></div>

                                  <div className="space-y-10 relative z-10">
                                     {activities.map((act, idx) => (
                                       <motion.div 
                                         key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                         className="flex gap-6"
                                       >
                                          <div className="w-16 shrink-0 text-right pt-4">
                                             <span className="text-[10px] font-black text-sunset-gold bg-sunset-gold/10 px-2 py-1 rounded-md border border-sunset-gold/20 shadow-sm uppercase tracking-widest">
                                               {act.time}
                                             </span>
                                          </div>
                                          <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} className="flex-1">
                                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-sunset-gold/30 transition-all shadow-md group/card">
                                               <h4 className="font-display text-xl font-bold mb-2 text-white group-hover/card:text-sunset-gold transition-colors">{act.activity}</h4>
                                               <div className="flex items-center gap-2 text-seafoam text-[11px] font-black uppercase tracking-widest mb-4">
                                                  <MapPin size={14}/> {act.location}
                                               </div>
                                               <p className="text-sm text-white/50 font-medium italic border-l-2 border-sunset-gold/30 pl-4 leading-relaxed line-clamp-3 group-hover/card:text-white/70 transition-colors">
                                                 "{act.tip}"
                                               </p>
                                            </div>
                                          </Tilt>
                                       </motion.div>
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
