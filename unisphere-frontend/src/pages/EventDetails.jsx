import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Ticket, User as UserIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [clusteredEvents, setClusteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchEventDetails();
        fetchClusteredEvents();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) setRole(user.role);
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvent(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching event details", error);
            navigate('/events');
        }
    };

    const fetchClusteredEvents = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/events/${id}/clustering`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClusteredEvents(response.data);
        } catch (error) {
            console.error("Error fetching clustered events", error);
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/events/${id}/register`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Digital Pass successfully generated!\nYour Token: ' + response.data.passToken);
            fetchEventDetails();
        } catch (error) {
            console.error("Error securing digital pass", error);
            alert(error.response?.data?.message || 'Failed to complete registration');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
                <div className="animate-pulse text-indigo-600 font-bold text-xl">Loading Event...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col font-sans">
            <Navbar />
            <motion.main 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow p-4 sm:p-8 max-w-5xl mx-auto w-full"
            >
                <Link to="/events" className="inline-flex items-center text-indigo-600 font-bold mb-6 hover:text-indigo-800 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 overflow-hidden mb-12">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-4 uppercase tracking-wider shadow-sm">
                            {event.category || 'General'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">{event.title}</h1>
                        <p className="text-indigo-100 text-lg max-w-2xl relative z-10 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold text-indigo-950 border-b border-indigo-50 pb-3">Event Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start">
                                    <div className="bg-indigo-100 p-3 rounded-2xl mr-4 text-indigo-600">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Date</p>
                                        <p className="text-lg font-bold text-indigo-900">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-indigo-100 p-3 rounded-2xl mr-4 text-indigo-600">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Time</p>
                                        <p className="text-lg font-bold text-indigo-900">{event.time || 'TBD'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-indigo-100 p-3 rounded-2xl mr-4 text-indigo-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Location</p>
                                        <p className="text-lg font-bold text-indigo-900">{event.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-indigo-100 p-3 rounded-2xl mr-4 text-indigo-600">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Organizer</p>
                                        <p className="text-lg font-bold text-indigo-900">{event.organizer?.name || 'UniSphere Official'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center text-center">
                            <Users className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <p className="text-3xl font-black text-indigo-900 mb-1">{event.attendees?.length || 0}</p>
                            <p className="text-sm font-bold text-gray-500 uppercase mb-8">Registered Students</p>
                            
                            {role === 'student' ? (
                                <button
                                    onClick={handleRegister}
                                    className="w-full py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg flex items-center justify-center"
                                >
                                    <Ticket className="w-5 h-5 mr-2" /> RSVP Now
                                </button>
                            ) : (
                                <div className="text-sm font-bold text-indigo-600 bg-white py-3 rounded-2xl shadow-sm border border-indigo-100">
                                    Only Students can RSVP
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- START OF AI CLUSTERING RECOMMENDATIONS --- */}
                {clusteredEvents.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-extrabold text-indigo-950 mb-6 flex items-center">
                            <Sparkles className="w-6 h-6 text-indigo-600 mr-2" />
                            Students Also Attended
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {clusteredEvents.map(clusterEvent => (
                                <Link 
                                    to={`/events/${clusterEvent._id}`}
                                    key={clusterEvent._id} 
                                    className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg border border-indigo-100 transition flex flex-col group"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">{clusterEvent.title}</h3>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{clusterEvent.description}</p>
                                    <div className="mt-auto flex items-center text-xs font-bold text-indigo-400">
                                        <Calendar className="w-3 h-3 mr-1" /> {new Date(clusterEvent.date).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
                {/* --- END OF AI CLUSTERING RECOMMENDATIONS --- */}
                
            </motion.main>
        </div>
    );
}
