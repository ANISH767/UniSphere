import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Calendar, Users, Sparkles, GraduationCap, ArrowRight, MapPin, Clock } from 'lucide-react';

const API_BASE_URL = 'https://unisphere-api-9j0u.onrender.com';

const getCategoryColor = (category) => {
  const map = {
    'Technology': 'from-cyan-500 to-blue-600',
    'Cultural': 'from-fuchsia-500 to-purple-600',
    'Academic': 'from-emerald-500 to-teal-600',
    'Sports': 'from-orange-500 to-red-600',
    'Social': 'from-yellow-500 to-orange-600'
  };
  return map[category] || 'from-slate-500 to-slate-700';
};

const getCategoryImage = (category) => {
  const map = {
    'Technology': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Cultural': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Academic': 'https://images.unsplash.com/photo-1475721025599-590528b33fac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Social': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };
  return map[category] || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
};

export default function Landing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/events`);
        // Slice top 8 events
        setEvents(response.data.slice(0, 8));
      } catch (error) {
        console.error("Error fetching live events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const displayEvents = events.length > 0 ? events : []; // Could put fallback DUMMY_EVENTS here if API is down

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#05050F] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30"
    >
      
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 150, ease: "linear" }} className="absolute w-[200vw] h-[200vw] lg:w-[100vw] lg:h-[100vw]">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[140px] mix-blend-screen"></motion.div>
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 2 }} className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-fuchsia-600 rounded-full blur-[140px] mix-blend-screen"></motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 4 }} className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-blue-500 rounded-full blur-[140px] mix-blend-screen"></motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex items-center space-x-3 cursor-pointer">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400 tracking-tighter">
              UniSphere
            </span>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="hidden md:flex items-center space-x-8">
            <Link to="/login" className="text-slate-300 hover:text-white font-bold transition text-sm uppercase tracking-widest relative group">
              Log In
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/signup" className="px-8 py-3.5 bg-white text-indigo-950 font-black rounded-full hover:scale-105 transition-transform shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)]">
              Join Platform
            </Link>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center flex flex-col items-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center max-w-4xl">
            <motion.div variants={itemVariants} className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-black uppercase tracking-widest mb-10 backdrop-blur-xl shadow-2xl hover:bg-white/10 transition cursor-default">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> Live Platform Active
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white leading-[1.05] tracking-tighter mb-8">
              The Ultimate <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-blue-400 drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                Campus Experience.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-300/80 font-medium mb-14 max-w-3xl leading-relaxed">
              Discover verified campus events, join thriving student clubs, and let our predictive AI engine map the perfect social schedule tailored entirely for you.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
              <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-black rounded-full transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.8)] hover:scale-105 flex items-center justify-center group text-lg">
                Start Your Journey
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </main>

        {/* Infinite Carousel Section */}
        <section className="py-20 relative z-10 w-full overflow-hidden bg-white/5 border-y border-white/10 backdrop-blur-3xl">
          <div className="max-w-7xl mx-auto px-6 mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Live Upcoming Experiences</h2>
              <p className="text-slate-400 font-medium text-lg">Swipe through the most anticipated events happening on campus right now.</p>
            </div>
            <div className="hidden md:flex space-x-2">
              <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <div className="w-3 h-1 bg-white/20 rounded-full"></div>
              <div className="w-3 h-1 bg-white/20 rounded-full"></div>
            </div>
          </div>

          <div className="flex w-full relative min-h-[400px] items-center">
            {loading ? (
              <div className="w-full flex justify-center text-indigo-400 font-medium">Loading live events...</div>
            ) : displayEvents.length > 0 ? (
              <motion.div 
                className="flex gap-6 px-6"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 30, repeat: Infinity }}
              >
                {/* Duplicate array for seamless infinite scrolling */}
                {[...displayEvents, ...displayEvents, ...displayEvents].map((event, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -15, scale: 1.02 }}
                    className="w-[320px] md:w-[400px] shrink-0 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md group hover:bg-white/10 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] hover:border-white/20 transition-all duration-300 relative cursor-pointer"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                      <img src={getCategoryImage(event.category)} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <div className={`absolute top-5 right-5 z-20 px-4 py-1.5 bg-gradient-to-r ${getCategoryColor(event.category)} rounded-full text-xs font-black text-white shadow-lg uppercase tracking-wider`}>
                        {event.category || 'General'}
                      </div>
                      
                      <div className="absolute bottom-5 left-5 z-20 w-[80%]">
                          <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-1 group-hover:text-indigo-300 transition-colors">{event.title}</h3>
                      </div>
                    </div>
                    
                    {/* Hover Reveal Metadata */}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm font-medium text-slate-300">
                          <Calendar className="w-4 h-4 mr-3 text-indigo-400 shrink-0" /> 
                          {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-300">
                          <Clock className="w-4 h-4 mr-3 text-fuchsia-400 shrink-0" /> {event.time}
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-300">
                          <MapPin className="w-4 h-4 mr-3 text-blue-400 shrink-0" /> {event.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/50 rounded-[2rem] transition duration-500 pointer-events-none"></div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
               <div className="w-full flex justify-center text-slate-500">No upcoming events currently scheduled.</div>
            )}
          </div>
        </section>

        {/* Global Footer */}
        <footer className="border-t border-white/5 py-12 mt-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0 opacity-50 hover:opacity-100 transition">
              <GraduationCap className="w-5 h-5 text-indigo-400 mr-2" />
              <span className="font-bold text-slate-300 tracking-wider">UNISPHERE</span>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-wide">© 2026 UniSphere SaaS Platforms. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </motion.div>
  );
}
