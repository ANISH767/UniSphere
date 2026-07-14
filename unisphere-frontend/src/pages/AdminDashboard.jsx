import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, TrendingUp, Shield, Database, Activity, Clock, MapPin, CheckCircle, AlertTriangle, AlertCircle, Check, X, Terminal, BarChart3, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminProfile from '../assets/admin_profile.png';

export default function AdminDashboard() {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, totalAttendees: 0, topCategory: 'N/A' });
    const [heatmapData, setHeatmapData] = useState([]);
    const [users, setUsers] = useState([]);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', action: null });
    
    // Attendees Modal State
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [attendeesList, setAttendeesList] = useState([]);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [modalEventTitle, setModalEventTitle] = useState('');

    const token = sessionStorage.getItem('token');
    
    const [userName, setUserName] = useState('Admin');
    
    // Live Feed Dummy Data generator
    const [liveFeed, setLiveFeed] = useState([
        { id: 1, time: 'Just now', msg: 'System initialized successfully.', type: 'info' },
        { id: 2, time: '2m ago', msg: 'New event "Tech Innovation" pending review.', type: 'alert' }
    ]);

    useEffect(() => {
        if (token) {
            try {
                const user = JSON.parse(sessionStorage.getItem('user'));
                if (user && user.name) setUserName(user.name);
            } catch (e) {
                console.error(e);
            }
        }
    }, [token]);

    useEffect(() => {
        fetchSystemData();
        fetchHeatmapData();
        fetchUsers();

        // Simulate live feed updates
        const interval = setInterval(() => {
            const types = ['info', 'alert', 'success'];
            const actions = ['User registration spiked.', 'Database synced.', 'New event created in Cultural.', 'Anomaly detected in attendance pattern.'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const randomMsg = actions[Math.floor(Math.random() * actions.length)];
            
            setLiveFeed(prev => {
                const newFeed = [{ id: Date.now(), time: 'Just now', msg: randomMsg, type: randomType }, ...prev];
                return newFeed.slice(0, 5); // Keep last 5
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const fetchAttendeesForEvent = async (eventId, eventTitle) => {
        setModalEventTitle(eventTitle);
        setShowAttendeesModal(true);
        setAttendeesLoading(true);
        try {
            const response = await axios.get(`https://unisphere-api-9j0u.onrender.com/api/events/${eventId}/attendees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendeesList(response.data);
        } catch (error) {
            console.error("Error fetching attendees:", error);
            alert("Failed to load attendees.");
        } finally {
            setAttendeesLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await axios.delete(`https://unisphere-api-9j0u.onrender.com/api/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSystemData();
            setLiveFeed(prev => [{ id: Date.now(), time: 'Just now', msg: 'Event deleted.', type: 'alert' }, ...prev].slice(0, 5));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`https://unisphere-api-9j0u.onrender.com/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            setLiveFeed(prev => [{ id: Date.now(), time: 'Just now', msg: 'User removed from platform.', type: 'alert' }, ...prev].slice(0, 5));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const promptConfirm = (title, message, action) => {
        setConfirmModal({ show: true, title, message, action });
    };

    const fetchSystemData = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const fetchedEvents = response.data;
            setEvents(fetchedEvents);

            const totalAttendees = fetchedEvents.reduce((sum, ev) => sum + (ev.attendees?.length || 0), 0);
            const categories = fetchedEvents.map(ev => ev.category || 'General');
            const topCategory = categories.sort((a, b) =>
                categories.filter(v => v === a).length - categories.filter(v => v === b).length
            ).pop() || 'N/A';

            setStats({
                totalEvents: fetchedEvents.length,
                totalAttendees,
                topCategory
            });
        } catch (error) {
            console.error("Error fetching system events", error);
        }
    };

    const fetchHeatmapData = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/analytics/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHeatmapData(response.data.heatmapData || []);
        } catch (error) {
            console.error("Error fetching heatmap data", error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`https://unisphere-api-9j0u.onrender.com/api/events/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSystemData();
            
            // Add to live feed
            setLiveFeed(prev => [{ id: Date.now(), time: 'Just now', msg: `Event ${status.toLowerCase()} by admin.`, type: 'success' }, ...prev].slice(0, 5));
        } catch (error) {
            alert('Failed to update event status');
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'General': 'bg-slate-800 text-slate-300 border-slate-700',
            'Academic': 'bg-blue-900/50 text-blue-300 border-blue-800',
            'Sports': 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
            'Cultural': 'bg-purple-900/50 text-purple-300 border-purple-800',
            'Technology': 'bg-cyan-900/50 text-cyan-300 border-cyan-800',
            'Social': 'bg-pink-900/50 text-pink-300 border-pink-800'
        };
        return colors[category] || 'bg-slate-800 text-slate-300 border-slate-700';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
    };

    // Calculate underperforming items for Insights
    const totalEngagement = heatmapData.reduce((sum, item) => sum + item.engagement, 0);
    const avgEngagement = heatmapData.length > 0 ? totalEngagement / heatmapData.length : 0;
    const underperforming = heatmapData.filter(item => item.engagement < (avgEngagement * 0.5));

    // Dummy chart data
    const chartData = [40, 65, 30, 85, 55, 95, 75];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full font-sans">

            {/* Dark Theme Container Wrapper since Admin is 'Command Center' */}
            <div className="bg-[#0B0A1A] text-slate-200 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-indigo-500/20">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                    className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-950 via-purple-900/40 to-slate-900 p-10 rounded-[2rem] shadow-2xl border border-indigo-500/30 relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>

                    <div className="flex-grow text-center md:text-left relative z-10">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest mb-5">
                            <Shield className="w-4 h-4 mr-2" /> Master Control Hub
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
                            System Administration
                        </h1>
                        <p className="text-indigo-200/80 text-lg font-medium">Global campus engagement metrics and master event moderation.</p>
                    </div>
                    <div className="shrink-0 relative z-10 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition duration-500"></div>
                        <img src={adminProfile} alt="Admin Profile" className="relative w-28 h-28 md:w-36 md:h-36 rounded-full object-cover shadow-2xl border-4 border-indigo-400/50" />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Primary Stats & Animated Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-lg border border-indigo-400/30 text-white relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition duration-500"></div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20"><Calendar className="w-7 h-7 text-indigo-100" /></div>
                                    <div className="flex items-center text-xs font-black text-indigo-200 uppercase tracking-widest">Total Events <Activity className="w-4 h-4 ml-2" /></div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-6xl font-black tracking-tighter">{stats.totalEvents}</p>
                                    <p className="text-sm font-bold text-indigo-200 mt-2">Active hosted sessions</p>
                                </div>
                            </motion.div>

                            <motion.div variants={cardVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-fuchsia-600 to-purple-700 p-8 rounded-3xl shadow-lg border border-fuchsia-400/30 text-white relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition duration-500"></div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20"><Users className="w-7 h-7 text-fuchsia-100" /></div>
                                    <div className="flex items-center text-xs font-black text-fuchsia-200 uppercase tracking-widest">Global Reach <TrendingUp className="w-4 h-4 ml-2" /></div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-6xl font-black tracking-tighter">{stats.totalAttendees}</p>
                                    <p className="text-sm font-bold text-fuchsia-200 mt-2">Verified campus attendees</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Animated dummy charts */}
                        <div className="bg-[#12112A] p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                            <h3 className="text-lg font-black text-white flex items-center mb-8">
                                <BarChart3 className="w-5 h-5 mr-3 text-indigo-400" /> Platform Traffic Trends
                            </h3>
                            <div className="h-48 flex items-end justify-between gap-2 px-2">
                                {chartData.map((val, idx) => (
                                    <div key={idx} className="w-full flex flex-col justify-end items-center group">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            transition={{ duration: 1.5, type: "spring", bounce: 0.3, delay: idx * 0.1 }}
                                            className="w-full max-w-[40px] bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t-xl group-hover:from-fuchsia-900 group-hover:to-fuchsia-500 transition-colors relative"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded">
                                                {val}k
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Flank: Activity Feed & Insights */}
                    <div className="space-y-8 h-full flex flex-col">
                        {/* Live Activity Feed */}
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden flex-grow flex flex-col">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full m-8 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                            <h3 className="text-lg font-black text-white flex items-center mb-6 border-b border-indigo-500/20 pb-4">
                                <Terminal className="w-5 h-5 mr-3 text-emerald-400" /> Live Event Stream
                            </h3>
                            <div className="space-y-4 flex-grow overflow-hidden relative">
                                <AnimatePresence mode="popLayout">
                                    {liveFeed.map(feed => (
                                        <motion.div 
                                            key={feed.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex items-start gap-3"
                                        >
                                            <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${feed.type === 'alert' ? 'text-rose-400' : feed.type === 'success' ? 'text-emerald-400' : 'text-indigo-400'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-200">{feed.msg}</p>
                                                <p className="text-xs text-slate-500 mt-1">{feed.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Automated Insights */}
                        <div className="bg-[#12112A] p-6 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <h3 className="text-lg font-bold text-white flex items-center mb-5 border-b border-indigo-500/20 pb-3">
                                <AlertCircle className="w-5 h-5 mr-2 text-rose-400" /> Automated Insights
                            </h3>
                            {underperforming.length > 0 ? (
                                <div className="space-y-3 relative z-10 max-h-[150px] overflow-y-auto">
                                    {underperforming.map((item, idx) => (
                                        <div key={idx} className="bg-rose-950/30 border border-rose-900/50 p-3 rounded-2xl flex items-start">
                                            <AlertTriangle className="w-4 h-4 text-rose-400 mr-3 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-rose-200">{item.clubName} - {item.tag}</p>
                                                <p className="text-xs text-rose-300/70 mt-1">Underperforming relative to campus average.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-2xl flex items-start">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-200">System Healthy</p>
                                        <p className="text-xs text-emerald-300/70 mt-1">All monitored metrics and tags are performing at or above baseline.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- ENGAGEMENT HEATMAP --- */}
                <div className="bg-[#12112A] rounded-3xl shadow-2xl border border-indigo-500/20 mb-12 overflow-hidden">
                    <div className="px-8 py-6 border-b border-indigo-500/20 bg-gradient-to-r from-[#17153B] to-[#12112A]">
                        <h2 className="text-2xl font-black text-white flex items-center tracking-tight">
                            <Activity className="w-6 h-6 mr-3 text-indigo-400" /> Engagement Heatmap
                        </h2>
                        <p className="text-sm text-indigo-300/70 mt-1">Visualizing participation density by tags and clubs</p>
                    </div>
                    <div className="p-8 flex flex-wrap gap-4">
                        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap gap-4 w-full">
                            {heatmapData.length === 0 ? (
                                <p className="text-slate-500 font-bold p-4">Insufficient data to generate heatmap.</p>
                            ) : (
                                heatmapData.map((item, idx) => {
                                    const intensity = item.engagement > 50 ? 'bg-fuchsia-600' :
                                                      item.engagement > 20 ? 'bg-purple-600' :
                                                      item.engagement > 5 ? 'bg-indigo-600' : 'bg-slate-700';
                                    return (
                                        <motion.div key={idx} variants={cardVariants} whileHover={{ scale: 1.05 }} className={`${intensity} px-4 py-4 rounded-2xl flex flex-col items-center justify-center flex-grow transition shadow-lg border border-white/10`}>
                                            <span className="text-3xl font-black text-white">{item.engagement}</span>
                                            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1 text-center">{item.tag}<br/>({item.clubName})</span>
                                        </motion.div>
                                    )
                                })
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* --- MASTER EVENT DIRECTORY --- */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-[#12112A] rounded-3xl shadow-2xl border border-indigo-500/20 overflow-hidden">
                    <div className="px-8 py-6 border-b border-indigo-500/20 bg-gradient-to-r from-[#17153B] to-[#12112A]">
                        <h2 className="text-2xl font-black text-white flex items-center tracking-tight">
                            <Database className="w-6 h-6 mr-3 text-indigo-400" /> Master Event Directory
                        </h2>
                        <p className="text-sm text-indigo-300/70 mt-1">Real-time system event moderation and approval workflows</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-[#0A0915] border-b border-indigo-500/20 text-indigo-200">
                                <tr>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Event Title</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Category</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Date & Time</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-center">Registrations</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-center">System Status & Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-500/10">
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-16 text-center text-slate-500">
                                            <Database className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-medium">No events found in the secure database.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    events.map((event, index) => (
                                        <motion.tr key={event._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (index * 0.05) }} className="hover:bg-indigo-900/20 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-white group-hover:text-indigo-300 transition-colors">{event.title}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(event.category)}`}>{event.category || 'General'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col space-y-1.5">
                                                    <div className="flex items-center text-slate-400"><Calendar className="w-3.5 h-3.5 mr-2" /> <span className="font-bold">{new Date(event.date).toLocaleDateString()}</span></div>
                                                    <div className="flex items-center text-slate-400"><Clock className="w-3.5 h-3.5 mr-2" /> <span className="font-bold">{event.time || 'TBD'}</span></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="inline-flex items-center justify-center font-black text-indigo-300 bg-indigo-950/50 px-4 py-1.5 rounded-xl border border-indigo-500/20">
                                                    <Users className="w-4 h-4 mr-2" /> {event.attendees?.length || 0}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col space-y-2 w-full max-w-[200px] mx-auto">
                                                    {event.status === 'Pending' && (
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => handleStatusUpdate(event._id, 'Approved')} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 transition flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                                            </button>
                                                            <button onClick={() => handleStatusUpdate(event._id, 'Rejected')} className="flex-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 py-2 rounded-xl text-xs font-bold border border-rose-500/30 transition flex items-center justify-center">
                                                                <X className="w-3.5 h-3.5 mr-1" /> Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex space-x-2 w-full">
                                                        <button onClick={() => fetchAttendeesForEvent(event._id, event.title)} className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 transition flex items-center justify-center">
                                                            <Users className="w-3.5 h-3.5 mr-1.5" /> Attendees
                                                        </button>
                                                        <button onClick={() => promptConfirm('Delete Event', `Are you sure you want to delete "${event.title}"? This action cannot be undone.`, () => handleDeleteEvent(event._id))} className="flex-1 bg-rose-900/40 hover:bg-rose-600/50 text-rose-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-900/50 transition flex items-center justify-center">
                                                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* --- MASTER USER DIRECTORY --- */}
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mt-12 bg-[#12112A] rounded-3xl shadow-2xl border border-indigo-500/20 overflow-hidden">
                    <div className="px-8 py-6 border-b border-indigo-500/20 bg-gradient-to-r from-[#17153B] to-[#12112A]">
                        <h2 className="text-2xl font-black text-white flex items-center tracking-tight">
                            <Users className="w-6 h-6 mr-3 text-indigo-400" /> Master User Directory
                        </h2>
                        <p className="text-sm text-indigo-300/70 mt-1">Platform user moderation and access control</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-[#0A0915] border-b border-indigo-500/20 text-indigo-200">
                                <tr>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Name</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Email</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px]">Role</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-500/10">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-16 text-center text-slate-500">
                                            <p className="text-lg font-medium">No users found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <motion.tr key={user._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (index * 0.05) }} className="hover:bg-indigo-900/20 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-white group-hover:text-indigo-300 transition-colors">{user.name}</td>
                                            <td className="px-8 py-5 text-indigo-200/70 font-medium">{user.email}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800' : user.role === 'faculty' ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button onClick={() => promptConfirm('Remove User', `Are you sure you want to completely remove "${user.name}" from the platform?`, () => handleDeleteUser(user._id))} className="bg-rose-900/40 hover:bg-rose-600/50 text-rose-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-900/50 transition inline-flex items-center shadow-lg">
                                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>

            {/* --- MODALS --- */}
            
            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#12112A] rounded-3xl shadow-2xl border border-rose-500/30 p-8 max-w-md w-full z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <h3 className="text-2xl font-black text-white mb-3 flex items-center"><AlertTriangle className="w-6 h-6 mr-3 text-rose-500" /> {confirmModal.title}</h3>
                            <p className="text-indigo-200/80 mb-8 font-medium">{confirmModal.message}</p>
                            <div className="flex space-x-4">
                                <button onClick={() => setConfirmModal({ show: false, title: '', message: '', action: null })} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition">Cancel</button>
                                <button onClick={() => { confirmModal.action(); setConfirmModal({ show: false, title: '', message: '', action: null }); }} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold transition shadow-[0_0_15px_rgba(225,29,72,0.4)]">Confirm</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Attendees Modal */}
            <AnimatePresence>
                {showAttendeesModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAttendeesModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#12112A] rounded-3xl shadow-2xl border border-indigo-500/30 p-8 max-w-2xl w-full max-h-[80vh] flex flex-col z-10 overflow-hidden">
                            <button onClick={() => setShowAttendeesModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 transition"><X className="w-6 h-6 text-slate-400" /></button>
                            <h3 className="text-2xl font-black text-white mb-2 flex items-center"><Users className="w-6 h-6 mr-3 text-indigo-400" /> Event Roster</h3>
                            <p className="text-indigo-300/80 mb-6 font-bold">{modalEventTitle}</p>
                            
                            <div className="overflow-y-auto flex-grow bg-[#0A0915] rounded-2xl border border-indigo-500/20">
                                {attendeesLoading ? (
                                    <div className="p-8 text-center text-indigo-400 font-bold animate-pulse">Loading roster...</div>
                                ) : attendeesList.length === 0 ? (
                                    <div className="p-8 text-center text-indigo-400 font-bold">No students registered yet.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#17153B] border-b border-indigo-500/20 sticky top-0 z-10 backdrop-blur-md text-indigo-200">
                                            <tr>
                                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px]">Name</th>
                                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px]">Email</th>
                                                <th className="py-4 px-6 font-black uppercase tracking-widest text-[10px]">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-500/10 text-slate-300">
                                            {attendeesList.map(reg => (
                                                <tr key={reg._id} className="hover:bg-indigo-900/20 transition-colors">
                                                    <td className="py-3 px-6 font-bold text-white">{reg.student?.name}</td>
                                                    <td className="py-3 px-6 font-medium text-indigo-200/70">{reg.student?.email}</td>
                                                    <td className="py-3 px-6">
                                                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                                                            {reg.student?.role}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
