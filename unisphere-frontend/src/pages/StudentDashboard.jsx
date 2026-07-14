import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Calendar, MapPin, Clock, Ticket, Sparkles, CheckCircle, Navigation, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import studentProfile from '../assets/student_profile.png';

export default function StudentDashboard() {
    const [events, setEvents] = useState([]);
    const [recommendedEvents, setRecommendedEvents] = useState([]);
    const [activePasses, setActivePasses] = useState({});
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('Student');
    const token = localStorage.getItem('token');
    
    useEffect(() => {
        if (token) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    if (user.name) setUserName(user.name);
                    if (user.id || user._id) setUserId(user.id || user._id);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchEvents();
        fetchRecommendations();
    }, [token]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events", error);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/events/recommendations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendedEvents(response.data);
        } catch (error) {
            console.error("Error fetching AI recommendations", error);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            const response = await axios.post(`https://unisphere-api-9j0u.onrender.com/api/events/${eventId}/register`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivePasses(prev => ({ ...prev, [eventId]: response.data.passToken }));
            fetchEvents();
            alert('Digital Pass successfully generated!');
        } catch (error) {
            console.error("Error securing digital pass", error);
            alert(error.response?.data?.message || 'Failed to complete registration');
        }
    };

    const now = new Date();
    
    // Categorize Events
    const registeredEvents = events.filter(e => e.attendees?.includes(userId));
    const upcomingRegistered = registeredEvents.filter(e => new Date(e.date) >= now);
    const pastRegistered = registeredEvents.filter(e => new Date(e.date) < now);
    
    // Gamification Stats
    const eventsAttended = pastRegistered.length + 2; // Dummy boost for demo
    const level = Math.floor(eventsAttended / 5) + 1;
    const progressToNextLevel = (eventsAttended % 5) / 5 * 100;
    
    const getCategoryColor = (category) => {
        const colors = {
            'General': 'from-gray-400 to-gray-500',
            'Academic': 'from-blue-400 to-indigo-500',
            'Sports': 'from-emerald-400 to-teal-500',
            'Cultural': 'from-fuchsia-400 to-purple-500',
            'Technology': 'from-cyan-400 to-blue-500',
            'Social': 'from-rose-400 to-pink-500'
        };
        return colors[category] || 'from-gray-400 to-gray-500';
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const EventCard = ({ event, isPast, isRecommended }) => (
        <motion.div 
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] border border-indigo-50 flex flex-col transition-all relative overflow-hidden group ${isPast ? 'opacity-70 hover:opacity-100' : ''}`}
        >
            {isRecommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-tr from-fuchsia-500 to-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-[1.5rem] tracking-wider z-10 flex items-center shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI MATCH
                </div>
            )}
            <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest bg-gradient-to-r ${getCategoryColor(event.category)} mb-4 w-fit shadow-md`}>
                {event.category || 'General'}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</h3>
            <p className="text-sm text-slate-500 mb-6 flex-grow line-clamp-2 font-medium">{event.description}</p>
            
            <div className="text-xs font-bold text-slate-600 space-y-2.5 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100/50 transition-colors">
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2.5 text-indigo-500" /> <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2.5 text-indigo-500" /> <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2.5 text-indigo-500" /> <span>{event.time || 'TBD'}</span>
                </div>
            </div>

            {isPast ? (
                <div className="mt-auto w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Event Concluded
                </div>
            ) : event.attendees?.includes(userId) ? (
                <div className="mt-auto">
                    {activePasses[event._id] ? (
                        <div className="flex flex-col items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                            <QRCode value={activePasses[event._id]} size={80} className="mb-3 shadow-md rounded-lg p-1 bg-white" />
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Digital Pass</p>
                        </div>
                    ) : (
                        <div className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 mr-2" /> Registered
                        </div>
                    )}
                </div>
            ) : (
                <Link 
                    to={`/events/${event._id}`}
                    className="mt-auto w-full py-3.5 px-4 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-100 hover:border-transparent shadow-sm hover:shadow-lg"
                >
                    View Details
                </Link>
            )}
        </motion.div>
    );

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full font-sans">
            
            {/* Master Header & Gamification Section */}
            <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Welcome */}
                <div className="lg:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="flex-grow text-center md:text-left relative z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="w-3.5 h-3.5 mr-2" /> Student Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userName.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg mb-8 max-w-md">Your personalized campus dashboard is ready. Discover your next favorite event.</p>
                        <Link to="/events" className="inline-flex items-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-600/20">
                            <Navigation className="w-4 h-4 mr-2" /> Explore Network
                        </Link>
                    </div>
                    <div className="shrink-0 relative z-10">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                        <img src={studentProfile} alt="Student Profile" className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl border-4 border-white" />
                    </div>
                </div>

                {/* Gamification Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] shadow-xl border border-indigo-900 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-600/30 rounded-full blur-3xl"></div>
                    <div>
                        <h3 className="text-indigo-200 font-bold uppercase tracking-widest text-xs flex items-center mb-6">
                            <Trophy className="w-4 h-4 mr-2 text-fuchsia-400" /> Semester Involvement
                        </h3>
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-5xl font-black text-white leading-none">Lvl {level}</span>
                            <span className="text-indigo-300 font-bold pb-1">Campus Explorer</span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-8">Attend {(level * 5) - eventsAttended} more events to reach Level {level + 1}.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-indigo-300 mb-2">
                            <span>Progress</span>
                            <span>{progressToNextLevel}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-4 p-0.5 border border-slate-700">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${progressToNextLevel}%` }} 
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            ></motion.div>
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-400 bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700">
                            <Target className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> {eventsAttended} Total Events Attended
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                
                <div className="xl:col-span-2 space-y-12">
                    {/* AI Recommendations */}
                    {recommendedEvents.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
                                    <Sparkles className="w-6 h-6 mr-3 text-indigo-600" /> Curated For You
                                </h2>
                            </div>
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {recommendedEvents.slice(0, 4).map(event => <EventCard key={event._id} event={event} isRecommended={true} />)}
                            </motion.div>
                        </div>
                    )}

                    {/* Past Attended */}
                    {pastRegistered.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
                                    <Clock className="w-6 h-6 mr-3 text-slate-400" /> Your History
                                </h2>
                            </div>
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {pastRegistered.map(event => <EventCard key={event._id} event={event} isPast={true} />)}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Schedule Sidebar */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 sticky top-24">
                        <h2 className="text-xl font-black text-slate-900 flex items-center mb-8">
                            <Calendar className="w-5 h-5 mr-3 text-indigo-600" /> Upcoming Schedule
                        </h2>

                        {upcomingRegistered.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium text-sm">No upcoming events scheduled.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-100 before:to-transparent">
                                {upcomingRegistered.map((event, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: idx * 0.15 }}
                                        key={event._id} 
                                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                                        </div>
                                        
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group-hover:-translate-y-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${getCategoryColor(event.category)}`}>
                                                    {event.category}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2">{event.title}</h4>
                                            <div className="flex items-center text-xs font-bold text-slate-500">
                                                <Clock className="w-3 h-3 mr-1.5 text-slate-400" /> {event.time}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}