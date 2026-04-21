import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLocations, getRecommended } from '../api/client';
import { Compass, Calendar, Sparkles, Activity, ArrowRight, Leaf, MapPin, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

// Animated SVG Waves
function OceanWaves() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-[2] h-[200px]">
      <div className="absolute bottom-0 left-0 w-[200%] h-[140px] animate-wave1 opacity-80"
           style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'><path d='M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z' fill='%230A3D5C'/></svg>")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%' }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-[170px] animate-wave2 opacity-85"
           style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'><path d='M0,60 C200,10 400,110 600,60 C800,10 1000,110 1200,60 L1200,120 L0,120 Z' fill='%231A6A8A'/></svg>")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%' }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-[200px] animate-wave3 opacity-90"
           style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'><path d='M0,20 C150,60 300,0 600,60 C900,120 1050,40 1200,80 L1200,120 L0,120 Z' fill='%234FB3CE'/></svg>")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%' }} />
    </div>
  );
}

// Floating particles
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i, size: Math.random() * 4 + 2, left: Math.random() * 100, top: Math.random() * 50 + 50,
    duration: Math.random() * 10 + 15, delay: Math.random() * 15, color: Math.random() > 0.5 ? '#F4A443' : '#fff'
  }));
  return (
    <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full opacity-0"
             style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, background: p.color, boxShadow: `0 0 10px 2px ${p.color}40`, animation: `floatUp ${p.duration}s linear ${p.delay}s infinite` }} />
      ))}
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(100px) scale(0); opacity: 0; } 20% { opacity: 0.8; transform: translateY(0) scale(1); } 80% { opacity: 0.6; transform: translateY(-300px) scale(1); } 100% { transform: translateY(-400px) scale(0); opacity: 0; } }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [liveLocations, setLiveLocations] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const fetchLive = () => getLocations().then(setLiveLocations).catch(console.error);
    fetchLive();
    getRecommended().then(data => setRecommended(data.slice(0, 3))).catch(console.error);
    const intervalId = setInterval(fetchLive, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const getCrowdColor = (label) => ({ "low": "#2ED573", "moderate": "#F4A443", "high": "#FF6B6B", "very_high": "#FF3B3B" }[label] || "#94a3b8");
  const getCrowdBg = (label) => ({ "low": "rgba(46,213,115,0.15)", "moderate": "rgba(244,164,67,0.15)", "high": "rgba(255,107,107,0.15)", "very_high": "rgba(255,59,59,0.2)" }[label] || "rgba(148,163,184,0.1)");
  const categoryIcons = { beach: '🏖️', heritage: '🏛️', nature: '🌴', nightlife: '🎸', adventure: '🧗', food: '🍽️' };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-screen -ml-[calc((100vw-100%)/2)] h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent">
        
        {/* Animated Sun */}
        <motion.div 
          style={{ y: yHero }}
          className="absolute w-[180px] h-[180px] rounded-full z-[1]"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ background: 'radial-gradient(circle, #FFF 0%, #F4A443 60%, transparent 100%)', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 0 80px 30px rgba(244,164,67,0.6)', animation: 'pulseSun 3s ease-in-out infinite' }} 
        />
        
        <Particles />
        
        {/* Hero Content */}
        <motion.div 
          style={{ y: yHero }}
          className="relative z-10 text-center flex flex-col items-center -mt-[10vh] px-6"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-seafoam text-[11px] font-bold tracking-[0.3em] mb-5 uppercase">
            Powered by Deep AI Intelligence
          </motion.div>
          
          <h1 className="font-display text-[64px] md:text-[96px] text-white leading-[1.05] mb-2" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
            <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: "spring" }} className="inline-block">Discover</motion.span>{' '}
            <motion.span initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, type: "spring" }} className="inline-block">Goa</motion.span>
          </h1>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="font-display italic text-[32px] md:text-[48px] text-sunset-gold mb-6">
            Like Never Before
          </motion.h2>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="font-body text-lg text-sand-light/85 tracking-wide mb-10 max-w-lg">
            Real-time tracking · Predictive intelligence · Personalized paths
          </motion.p>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, type: "spring" }} className="flex flex-col sm:flex-row gap-5">
            <Link to="/explore" className="btn-gold px-10 py-4 text-base flex items-center gap-2">
              <Compass size={20} /> Explore Map
            </Link>
            <Link to="/itinerary" className="btn-glass px-10 py-4 text-base flex items-center gap-2">
              <Calendar size={20} /> Build Itinerary
            </Link>
          </motion.div>
        </motion.div>

        <OceanWaves />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
          <ChevronDown size={28} className="text-white" />
        </motion.div>
        
        {/* Floating cards */}
        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} className="absolute top-28 left-8 hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 z-10 animate-float" style={{ animationDelay: '0s' }}>
          <MapPin className="text-seafoam" size={22} />
          <div className="text-left"><p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Coordinates</p><p className="font-bold text-white text-sm">GPS Synced</p></div>
        </Tilt>
        <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} className="absolute top-44 right-8 hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 z-10 animate-float" style={{ animationDelay: '1s' }}>
          <Activity className="text-coral-glow" size={22} />
          <div className="text-left"><p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Tracking</p><p className="font-bold text-white text-sm">Live Crowds</p></div>
        </Tilt>
      </section>

      {/* LIVE CROWD TICKER */}
      <section className="bg-ocean-deep/60 backdrop-blur-md py-4 border-y border-white/10 overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full z-10 bg-gradient-to-r from-ocean-deep via-ocean-deep to-transparent px-6 flex items-center gap-2 shadow-[20px_0_30px_rgba(10,61,92,0.8)]">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-seafoam text-[11px] font-bold tracking-[0.15em] uppercase drop-shadow-md">Live Radar</span>
        </div>
        
        <div className="flex gap-5 whitespace-nowrap pl-[160px]" style={{ animation: 'scrollTicker 35s linear infinite' }}>
          {[...liveLocations, ...liveLocations, ...liveLocations].map((loc, i) => (
            <div key={i} className="inline-flex items-center gap-3 rounded-full px-5 py-2 border shrink-0 backdrop-blur-sm"
                 style={{ background: getCrowdBg(loc.crowd_label), borderColor: getCrowdColor(loc.crowd_label) + '50' }}>
              <span className="text-[13px] font-semibold text-white truncate max-w-[150px]">{loc.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: getCrowdColor(loc.crowd_label), boxShadow: `0 0 6px ${getCrowdColor(loc.crowd_label)}` }} />
                <span className="text-[10px] text-white/70 font-black tracking-wider uppercase">{loc.crowd_label?.replace("_", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI RECOMMENDED SECTION WITH 3D TILT */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display text-5xl text-white mb-3 drop-shadow-lg">Top AI Selections</h2>
            <p className="text-seafoam text-base font-medium">Dynamically scored using live crowd · weather · eco indices</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommended.map((rec, index) => (
              <motion.div 
                key={rec.id} 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02} transitionSpeed={2500} className="h-full">
                  <div className="card-goa p-8 h-full flex flex-col relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                    <div className="absolute -bottom-5 -right-3 text-[140px] opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                      {categoryIcons[rec.category] || '🌴'}
                    </div>

                    <div className="absolute top-6 right-6 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                         style={{ background: `conic-gradient(#F4A443 ${rec.score}%, rgba(255,255,255,0.05) 0)` }}>
                      <div className="absolute inset-[3px] rounded-full bg-night-sky/90 backdrop-blur-sm" />
                      <span className="relative z-10 font-bold text-xl text-sunset-gold leading-none">{rec.score}</span>
                      <span className="relative z-10 text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">AI Gen</span>
                    </div>

                    <span className="inline-block self-start px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border"
                          style={{
                            background: rec.category === 'beach' ? 'rgba(79,179,206,0.15)' : rec.category === 'heritage' ? 'rgba(244,164,67,0.15)' : 'rgba(45,106,79,0.2)',
                            borderColor: rec.category === 'beach' ? 'rgba(79,179,206,0.4)' : rec.category === 'heritage' ? 'rgba(244,164,67,0.4)' : 'rgba(45,106,79,0.4)',
                            color: rec.category === 'beach' ? '#4FB3CE' : rec.category === 'heritage' ? '#F4A443' : '#4ade80'
                          }}>
                      {rec.category}
                    </span>

                    <h3 className="font-display text-3xl text-white mb-3 drop-shadow">{rec.name}</h3>
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-6 flex-1">{rec.explanation}</p>

                    <div className="flex gap-4 pt-4 border-t border-white/10 items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: getCrowdColor(rec.current_crowd_label), boxShadow: `0 0 10px ${getCrowdColor(rec.current_crowd_label)}` }} />
                        <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{rec.current_crowd_label?.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                        <Leaf size={12} /> {rec.eco_score}/10
                      </div>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION WITH MOTION */}
      <section className="bg-sand-light/90 backdrop-blur-xl py-24 px-4 relative overflow-hidden text-ocean-deep">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold inline-block relative border-b-4 border-sunset-gold pb-3">
              Your Smart Travel Core
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🗺️', name: 'Real GPS Sync', desc: 'React Leaflet integration maps exact longitude and latitude coordinates in real-time.' },
              { icon: '🤖', name: 'LLM Orchestration', desc: 'Dynamic itinerary planning handled securely by advanced NLP processors on Groq clouds.' },
              { icon: '🏄', name: 'Golden Hour Aesthetics', desc: 'Award-winning Framer Motion 3D effects blended with deep UX glassmorphism.' }
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 h-full">
                  <div className="text-[48px] mb-4 drop-shadow-md">{f.icon}</div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-night-sky">{f.name}</h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed">{f.desc}</p>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-night-sky/90 backdrop-blur-xl border-t border-white/5 py-10 px-4 text-center">
        <div className="font-display text-2xl text-gradient-gold mb-2 drop-shadow">🌴 GoaMind 2.0</div>
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Architected for Golden Hour • Framer Motion Elevated</p>
      </footer>
    </div>
  );
}
