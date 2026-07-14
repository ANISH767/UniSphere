import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, MapPin, Calendar, Clock, Filter, Tag, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [recommendedIds, setRecommendedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [recommendedFilter, setRecommendedFilter] = useState(false);
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchEvents();
        fetchRecommendations();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Only show approved events if filtering by status, but backend returns all. We can filter if needed.
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
            const ids = new Set(response.data.map(e => e._id));
            setRecommendedIds(ids);
        } catch (error) {
            console.error("Error fetching AI recommendations", error);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
        const matchesRecommended = recommendedFilter ? recommendedIds.has(event._id) : true;
        return matchesSearch && matchesCategory && matchesRecommended;
    });

    // If "Recommended for Me" is toggled on, they are already filtered. 
    // If it's toggled off, we can reshuffle/sort them so recommended ones appear first.
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (!recommendedFilter) {
            const aRec = recommendedIds.has(a._id) ? 1 : 0;
            const bRec = recommendedIds.has(b._id) ? 1 : 0;
            if (aRec !== bRec) return bRec - aRec;
        }
        return new Date(a.date) - new Date(b.date);
    });

    const getCategoryColor = (category) => {
        const colors = {
            'General': 'from-gray-400 to-gray-500',
            'Academic': 'from-blue-400 to-indigo-500',
            'Sports': 'from-green-400 to-emerald-500',
            'Cultural': 'from-purple-400 to-fuchsia-500',
            'Technology': 'from-cyan-400 to-blue-500',
            'Social': 'from-pink-400 to-rose-500'
        };
        return colors[category] || 'from-gray-400 to-gray-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col font-sans">
            <Navbar />
            <motion.main 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow p-4 sm:p-8 max-w-7xl mx-auto w-full"
            >
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 tracking-tight mb-3">
                        Campus Events Directory
                    </h1>
                    <p className="text-gray-500 text-lg">Browse, filter, and discover everything happening around campus.</p>
                </div>

                {/* Filters */}
                <div className="mb-10 flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-indigo-100 shadow-sm">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border-0 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-indigo-50/50 transition-all text-indigo-900 font-medium"
                        />
                    </div>
                    
                    <div className="relative shrink-0 md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-indigo-400" />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 rounded-2xl border-0 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-indigo-50/50 transition-all appearance-none text-indigo-900 font-medium"
                        >
                            <option value="All">All Categories</option>
                            <option value="General">General</option>
                            <option value="Academic">Academic</option>
                            <option value="Sports">Sports</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Technology">Technology</option>
                            <option value="Social">Social</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => setRecommendedFilter(!recommendedFilter)}
                        className={`shrink-0 flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md ${recommendedFilter ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'}`}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {recommendedFilter ? "Showing AI Picks" : "Show Recommended"}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedEvents.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-white/50 backdrop-blur-md rounded-3xl border border-white">
                            <Calendar className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                            <p className="text-indigo-900/60 font-medium">No events found matching your criteria.</p>
                        </div>
                    ) : (
                        sortedEvents.map(event => (
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                key={event._id} 
                                className="bg-white p-7 rounded-3xl shadow-sm hover:shadow-xl border border-indigo-50 flex flex-col transition-all relative overflow-hidden group"
                            >
                                {recommendedIds.has(event._id) && !recommendedFilter && (
                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider z-10 flex items-center">
                                        <Sparkles className="w-3 h-3 mr-1" /> AI PICK
                                    </div>
                                )}
                                <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor(event.category)} mb-5 w-fit shadow-sm`}>
                                    {event.category || 'General'}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{event.title}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-2 leading-relaxed">{event.description}</p>
                                
                                <div className="text-sm text-gray-600 space-y-3 mb-6 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50/50">
                                    <div className="flex items-center font-medium">
                                        <MapPin className="w-4 h-4 mr-3 text-indigo-500" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center font-medium">
                                        <Calendar className="w-4 h-4 mr-3 text-indigo-500" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center font-medium">
                                        <Clock className="w-4 h-4 mr-3 text-indigo-500" />
                                        <span>{event.time || 'TBD'}</span>
                                    </div>
                                </div>

                                <Link 
                                    to={`/events/${event._id}`}
                                    className="mt-auto w-full py-4 px-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center shadow-md"
                                >
                                    View Details & RSVP
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.main>
        </div>
    );
}
