import { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { getLocations, deleteLocation, getRecommended } from '../api/client';
import { Search, SlidersHorizontal, Plus, Edit2, Trash2, Leaf, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

export default function Explore() {
  const [locations, setLocations] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [budFilter, setBudFilter] = useState('All');
  const [sortMethod, setSortMethod] = useState('');
  const [activeLoc, setActiveLoc] = useState(null);

  useEffect(() => {
    getLocations().then(res => setLocations(res)).catch(console.error);
    getRecommended().then(res => setRecommended(res)).catch(console.error);
  }, []);

  const augmentedLocations = locations.map(loc => {
    const rec = recommended.find(r => r.id === loc.id);
    return { ...loc, score: rec?.score || null };
  });

  const categories = ['All', 'beach', 'heritage', 'nature', 'nightlife', 'food', 'adventure'];
  const budgets = ['All', 'low', 'medium', 'high'];

  const filtered = augmentedLocations.filter(loc => {
    if (search && !loc.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'All' && loc.category.toLowerCase() !== catFilter.toLowerCase()) return false;
    if (budFilter !== 'All' && loc.budget_level.toLowerCase() !== budFilter.toLowerCase()) return false;
    return true;
  }).sort((a, b) => {
    if (sortMethod === 'Score') return (b.score || 0) - (a.score || 0);
    if (sortMethod === 'Crowd') return (a.crowd_level || 0) - (b.crowd_level || 0);
    if (sortMethod === 'Eco') return b.eco_score - a.eco_score;
    return 0;
  });

  const handleDelete = async (id) => {
    try {
      await deleteLocation(id);
      setLocations(prev => prev.filter(p => p.id !== id));
      if (activeLoc?.id === id) setActiveLoc(null);
    } catch (err) {
      console.error(err);
    }
  };
  
  const getCrowdColorClasses = (label) => {
     if(label === 'low') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
     if(label === 'moderate') return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
     if(label === 'high') return 'text-rose-400 bg-rose-400/10 border-rose-500/30';
     return 'text-rose-500 bg-rose-500/10 border-rose-500/50 animate-pulse';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      
      {/* Top Filter Strip */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-3.5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-ocean relative z-20 mx-2 lg:mx-0 border border-white/10">
        <div className="flex-1 min-w-[200px] relative">
           <Search size={18} className="absolute left-3.5 top-[11px] text-white/50" />
           <input 
             type="text" 
             placeholder="Search mapped coordinates..." 
             value={search} 
             onChange={e=>setSearch(e.target.value)} 
             className="w-full bg-white/5 border border-white/10 rounded-xl text-white outline-none pl-10 pr-4 py-2 text-sm font-medium focus:border-sunset-gold focus:ring-1 focus:ring-sunset-gold transition-all placeholder:text-white/30" 
           />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scroll flex-1 md:flex-none">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all duration-300 ${catFilter === c ? 'bg-sunset-gold text-night-sky shadow-gold' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'}`}>
              {c}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-white/40 px-2"><SlidersHorizontal size={18}/></span>
           <select value={budFilter} onChange={e=>setBudFilter(e.target.value)} className="bg-night-sky border border-white/10 text-white text-sm font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-sunset-gold">
             {budgets.map(b => <option key={b} value={b}>Budget: {b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
           </select>
           <select value={sortMethod} onChange={e=>setSortMethod(e.target.value)} className="bg-night-sky border border-white/10 text-white text-sm font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-seafoam">
             <option value="">Sort Matrix</option>
             <option value="Score">Top AI Match</option>
             <option value="Crowd">Lowest Crowds</option>
             <option value="Eco">Highest Eco</option>
           </select>
        </div>
      </motion.div>

      {/* Main Split Architecture */}
      <div className="flex-1 flex gap-6 overflow-hidden mx-2 lg:mx-0">
        
        {/* 60% Map Interface */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="hidden lg:block lg:w-3/5 h-full rounded-3xl relative z-0 shadow-ocean border border-white/10 overflow-hidden bg-night-sky/50 backdrop-blur-md">
          <MapView locations={filtered} activeLoc={activeLoc} onSelectActive={setActiveLoc} />
        </motion.div>

        {/* 40% Scrolling Listing */}
        <div className="w-full lg:w-2/5 h-full overflow-y-auto hide-scroll pb-24 relative px-1">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <AnimatePresence>
              {filtered.map(loc => (
                <motion.div key={loc.id} variants={itemVariants} layoutId={`card-${loc.id}`}>
                  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.01} transitionSpeed={2000}>
                    <div onClick={() => setActiveLoc(loc)}
                         className={`card-goa p-5 relative border border-white/10 overflow-hidden cursor-pointer ${activeLoc?.id === loc.id ? 'border-sunset-gold shadow-[0_0_20px_rgba(244,164,67,0.3)] bg-ocean-deep' : ''}`}>
                      
                      {activeLoc?.id === loc.id && (
                        <motion.div layoutId="active-indicator" className="absolute top-0 left-0 w-1 h-full bg-gradient-gold" />
                      )}

                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <h3 className="text-xl font-display font-extrabold tracking-tight text-white">{loc.name}</h3>
                        <div className="flex gap-1">
                          <button className="text-white/40 hover:text-seafoam p-1.5 rounded-lg hover:bg-white/5 transition-colors"><Edit2 size={16}/></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }} className="text-white/40 hover:text-coral-glow p-1.5 rounded-lg hover:bg-white/5 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-5 text-[10px] font-bold uppercase tracking-widest relative z-10">
                        <span className="bg-black/30 border border-white/5 text-white/80 px-2 py-1 rounded">{loc.category}</span>
                        <span className="bg-black/30 border border-white/5 text-white/80 px-2 py-1 rounded">{loc.budget_level}</span>
                        <span className={`px-2 py-1 rounded border flex items-center gap-1.5 ${getCrowdColorClasses(loc.crowd_label || 'low')}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                          {(loc.crowd_label || 'unknown').replace("_", " ")}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 relative z-10">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                           <Leaf size={14} /> Eco: {loc.eco_score}/10
                         </div>
                         {loc.score ? (
                           <div className="flex items-center gap-1.5 text-xs font-extrabold text-sunset-gold bg-sunset-gold/10 px-2 py-1 rounded-lg border border-sunset-gold/20 shadow-sm">
                             <Sparkles size={14} /> {loc.score} AI Match
                           </div>
                         ) : (
                           <div className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Pending Scan</div>
                         )}
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 glass rounded-3xl mt-10 border border-white/10">
                <Search className="mx-auto text-white/30 mb-4" size={48} />
                <h3 className="text-xl font-display font-bold text-white mb-2">No Coordinates Found</h3>
                <p className="text-sm text-white/50">Adjust your matrix filters above to reveal more locations.</p>
              </motion.div>
            )}
          </motion.div>
          
          <button title="Map New Coordinate" className="absolute bottom-6 right-2 w-14 h-14 bg-gradient-gold hover:shadow-gold rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-all z-10 group border border-white/20">
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300 drop-shadow-md" />
          </button>

        </div>
      </div>

    </div>
  );
}
