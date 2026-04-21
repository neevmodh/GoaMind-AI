import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import { Loader } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function SuspenseSpinner() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full h-[60vh] gap-4"
    >
      <Loader className="animate-spin text-sunset-gold" size={48} />
      <p className="text-white/60 font-display italic text-xl animate-pulse">Loading Magic...</p>
    </motion.div>
  );
}

function RouteTransitions() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <AnimatePresence mode="wait">
      <motion.main 
        key={location.pathname}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30, transition: { duration: 0.2 } }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full relative z-10 flex-1 ${!isHome ? 'max-w-7xl mx-auto px-4 py-8 mt-[72px]' : ''}`}
      >
        <Suspense fallback={<SuspenseSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col w-full relative overflow-x-hidden bg-night-sky text-white">
        {/* Global AI Generated Masterpiece Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="/bg-sunset.png" 
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
            alt="Goa Sunset AI Background"
          />
          <div className="absolute inset-0 bg-gradient-ocean mix-blend-multiply opacity-80" />
        </div>
        
        <Navbar />
        <RouteTransitions />
        <ChatBot />
      </div>
    </Router>
  );
}
