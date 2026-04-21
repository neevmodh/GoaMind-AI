import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { getWeather } from '../api/client';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    getWeather()
      .then(data => setWeather(data))
      .catch(() => setWeather({ temp: 28, description: "Sunny", icon: "01d" }));

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Itinerary', path: '/itinerary' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      scrolled 
        ? 'bg-ocean-deep/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-2xl tracking-tight transition-transform hover:scale-105 active:scale-95">
            <span className="text-2xl drop-shadow-lg">🌴</span>
            <span className="text-gradient-gold">GoaMind</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex h-full gap-8 items-center">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path}
                className={({ isActive }) => 
                  `relative font-body font-semibold text-sm transition-all py-2 hover:text-sunset-gold
                  ${isActive ? 'text-sunset-gold' : 'text-white/70'}
                  after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] 
                  after:bg-sunset-gold after:transition-transform after:duration-300
                  ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {weather && (
              <div className="flex items-center gap-2 text-sm font-semibold text-sunset-gold bg-sunset-gold/15 border border-sunset-gold/25 px-4 py-2 rounded-full">
                {weather.icon && (
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.icon}.png`} 
                    alt={weather.description} 
                    className="w-7 h-7 drop-shadow"
                  />
                )}
                <span>{Math.round(weather.temp)}°C</span>
                <span className="text-white/40">·</span>
                <span className="text-white/60 text-xs">Goa</span>
              </div>
            )}
            <Link to="/explore" className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
              Start Planning
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            {weather && (
              <div className="text-sm font-bold text-sunset-gold flex items-center gap-1 bg-sunset-gold/15 px-3 py-1.5 rounded-full border border-sunset-gold/25">
                ☀️ {Math.round(weather.temp)}°
              </div>
            )}
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)} 
              className="text-white/80 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-400 ${isMobileOpen ? 'max-h-80' : 'max-h-0'}`}>
        <div className="px-4 pt-2 pb-5 space-y-1 bg-ocean-deep/95 backdrop-blur-xl border-t border-white/10 mt-3">
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => 
                `block font-semibold text-base px-4 py-3 rounded-xl transition-colors
                ${isActive 
                  ? 'bg-sunset-gold/15 text-sunset-gold border border-sunset-gold/20' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
