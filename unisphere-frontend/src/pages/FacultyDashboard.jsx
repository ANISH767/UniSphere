import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Calendar, Clock, Users, QrCode, Plus, CheckCircle, XCircle, Sparkles, Calendar as CalendarIcon, TrendingUp, Edit3, BookOpen, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import facultyProfile from '../assets/faculty_profile.png';

const API_BASE_URL = 'https://unisphere-api-9j0u.onrender.com';

const DUMMY_ACADEMICS = [
  { 
      id: 1, course: "CS 401: Advanced AI Ethics", students: 45, avgGrade: "A-", lastUpdate: "2 days ago",
      roster: [
          { name: "Alex Johnson", id: "U99213", grade: "A", attendance: "98%" },
          { name: "Samantha Lee", id: "U88124", grade: "B+", attendance: "85%" },
          { name: "Michael Chen", id: "U77341", grade: "A-", attendance: "92%" },
      ]
  },
  { 
      id: 2, course: "ENG 302: Modern Literature", students: 30, avgGrade: "B+", lastUpdate: "5 hours ago",
      roster: [
          { name: "David Kim", id: "U11234", grade: "B", attendance: "78%" },
          { name: "Emma Wilson", id: "U22345", grade: "A", attendance: "95%" },
      ]
  }
];

const AcademicRow = ({ data }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <>
            <motion.tr 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setExpanded(!expanded)} 
                className="hover:bg-emerald-50/50 transition-colors cursor-pointer group border-b border-emerald-50 last:border-0"
            >
                <td className="py-4 px-6 font-bold text-emerald-950 group-hover:text-emerald-700">{data.course}</td>
                <td className="py-4 px-6 text-emerald-800 font-medium">{data.students} Enrolled</td>
                <td className="py-4 px-6 font-black text-emerald-600">{data.avgGrade}</td>
                <td className="py-4 px-6 text-sm text-emerald-400">{data.lastUpdate}</td>
                <td className="py-4 px-6 text-right text-emerald-500">
                    {expanded ? <ChevronUp className="w-5 h-5 inline" /> : <ChevronDown className="w-5 h-5 inline" />}
                </td>
            </motion.tr>
            <AnimatePresence>
                {expanded && (
                    <motion.tr 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-emerald-50/30 overflow-hidden border-b border-emerald-100/50"
                    >
                        <td colSpan="5" className="p-0">
                            <div className="py-6 px-10">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center">
                                    <Users className="w-4 h-4 mr-2" /> Live Course Roster
                                </h4>
                                <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-emerald-50/50 text-emerald-800 border-b border-emerald-100">
                                            <tr>
                                                <th className="py-3 px-6 font-bold">Student Name</th>
                                                <th className="py-3 px-6 font-bold">Student ID</th>
                                                <th className="py-3 px-6 font-bold">Current Grade</th>
                                                <th className="py-3 px-6 font-bold">Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-emerald-50">
                                            {data.roster.map((student, idx) => (
                                                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="py-3 px-6 font-medium text-slate-800">{student.name}</td>
                                                    <td className="py-3 px-6 text-slate-500 font-mono text-xs">{student.id}</td>
                                                    <td className="py-3 px-6 font-bold text-emerald-600">{student.grade}</td>
                                                    <td className="py-3 px-6 text-slate-600">{student.attendance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
};

export default function FacultyDashboard() {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('General');
    const [tags, setTags] = useState('');

    const [idealDates, setIdealDates] = useState(null);
    const [forecasts, setForecasts] = useState([]);

    const [scanToken, setScanToken] = useState('');
    const [scanResult, setScanResult] = useState(null);

    const [manualEmail, setManualEmail] = useState('');
    const [manualEventId, setManualEventId] = useState('');
    const [manualCheckinResult, setManualCheckinResult] = useState(null);

    const token = localStorage.getItem('token');
    const [userName, setUserName] = useState('Faculty');

    useEffect(() => {
        if (token) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.name) setUserName(user.name);
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(tokenPayload.userId);
            } catch (e) {
                console.error(e);
            }
        }
        fetchEvents();
        fetchAnalytics();
    }, [token]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const facultyEvents = response.data.filter(event => {
                if (!event.organizer) return false;
                if (typeof event.organizer === 'string') return event.organizer === currentUserId;
                return event.organizer._id === currentUserId;
            });
            setEvents(facultyEvents);
        } catch (error) {
            console.error("Error fetching events", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const idealRes = await axios.get(`${API_BASE_URL}/api/analytics/faculty/ideal-dates`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIdealDates(idealRes.data);

            const forecastRes = await axios.get(`${API_BASE_URL}/api/analytics/faculty`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForecasts(forecastRes.data.forecasts || []);
        } catch (error) {
            console.error("Error fetching analytics", error);
        }
    };

    const handleVerifyPass = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/events/verify-pass`, { attendanceToken: scanToken }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScanResult({ success: true, message: response.data.message, detail: `${response.data.studentName} - ${response.data.eventTitle}` });
            setScanToken('');
        } catch (error) {
            setScanResult({ success: false, message: error.response?.data?.message || 'Verification failed.' });
        }
    };

    const handleManualCheckin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/events/manual-checkin`, { studentEmail: manualEmail, eventId: manualEventId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setManualCheckinResult({ success: true, message: response.data.message, detail: response.data.studentName });
            setManualEmail('');
        } catch (error) {
            setManualCheckinResult({ success: false, message: error.response?.data?.message || 'Check-in failed.' });
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/events`, {
                title, description, date, time, location, category, tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            }, { headers: { Authorization: `Bearer ${token}` } });
            fetchEvents();
            fetchAnalytics();
            setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setCategory('General'); setTags('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create event');
        }
    };

    const applyIdealSuggestion = () => {
        if (idealDates && idealDates.idealTimes && idealDates.idealTimes.length > 0) {
            setTime(idealDates.idealTimes[0]);
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getForecastForEvent = (eventId) => {
        return forecasts.find(f => f._id === eventId);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'General': 'from-slate-600 to-slate-700',
            'Academic': 'from-emerald-500 to-teal-600',
            'Sports': 'from-green-500 to-emerald-600',
            'Cultural': 'from-teal-500 to-cyan-600',
            'Technology': 'from-cyan-500 to-blue-600',
            'Social': 'from-emerald-400 to-teal-500'
        };
        return colors[category] || 'from-slate-600 to-slate-700';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full font-sans">
            
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-100/50 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="flex-grow text-center md:text-left relative z-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="w-3.5 h-3.5 mr-2" /> Faculty Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight mb-3">
                        Welcome back, {userName.split(' ')[0]}
                    </h1>
                    <p className="text-emerald-900/60 text-lg font-medium">Coordinate events, manage attendance, and empower students.</p>
                </div>
                <div className="shrink-0 relative z-10">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                    <img src={facultyProfile} alt="Faculty Profile" className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl border-4 border-white" />
                </div>
            </div>

            {/* --- ACADEMICS SECTION (NEW) --- */}
            <div className="mb-12">
                <h2 className="text-3xl font-black text-emerald-950 flex items-center tracking-tight mb-8">
                    <BookOpen className="w-7 h-7 mr-3 text-emerald-600" /> Academics & Grading
                </h2>
                <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-100/50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-emerald-50 border-b border-emerald-100">
                            <tr>
                                <th className="py-5 px-6 font-bold text-emerald-900 uppercase tracking-widest text-xs">Course Name</th>
                                <th className="py-5 px-6 font-bold text-emerald-900 uppercase tracking-widest text-xs">Enrollment</th>
                                <th className="py-5 px-6 font-bold text-emerald-900 uppercase tracking-widest text-xs">Avg. Grade</th>
                                <th className="py-5 px-6 font-bold text-emerald-900 uppercase tracking-widest text-xs">Last Sync</th>
                                <th className="py-5 px-6"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {DUMMY_ACADEMICS.map(course => <AcademicRow key={course.id} data={course} />)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ATTENDANCE TRACKING SECTION --- */}
            <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Scanner */}
                <motion.div whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-emerald-600 to-teal-700 p-[2px] rounded-[2.5rem] shadow-xl">
                    <div className="bg-emerald-50/95 backdrop-blur-xl p-8 rounded-[calc(2.5rem-2px)] h-full">
                        <h2 className="text-2xl font-black text-emerald-950 mb-6 flex items-center">
                            <QrCode className="w-7 h-7 mr-3 text-emerald-600" /> Digital Pass Scanner
                        </h2>
                        <form onSubmit={handleVerifyPass} className="flex flex-col sm:flex-row gap-4">
                            <input type="text" placeholder="Scan Token (e.g., UNISPHERE-...)" value={scanToken} onChange={e => setScanToken(e.target.value)} className="flex-grow px-5 py-4 border-0 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner bg-white/90 font-bold" required />
                            <button type="submit" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md flex items-center justify-center shrink-0 transition-colors">
                                <CheckCircle className="w-5 h-5 mr-2" /> Verify
                            </button>
                        </form>
                        {scanResult && (
                            <div className={`mt-6 p-5 rounded-2xl text-sm font-bold flex items-start border ${scanResult.success ? 'bg-emerald-100 text-emerald-900 border-emerald-200' : 'bg-rose-100 text-rose-900 border-rose-200'}`}>
                                {scanResult.success ? <CheckCircle className="w-6 h-6 mr-3 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 mr-3 text-rose-600 shrink-0" />}
                                <div><p>{scanResult.message}</p>{scanResult.detail && <p className="text-xs mt-1 opacity-80">{scanResult.detail}</p>}</div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Manual Check-in */}
                <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100/50">
                    <h2 className="text-2xl font-black text-emerald-950 mb-6 flex items-center">
                        <Edit3 className="w-7 h-7 mr-3 text-emerald-600" /> Manual Check-in
                    </h2>
                    <form onSubmit={handleManualCheckin} className="space-y-4">
                        <input type="email" placeholder="Student Email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} className="w-full px-5 py-4 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" required />
                        <select value={manualEventId} onChange={e => setManualEventId(e.target.value)} className="w-full px-5 py-4 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none" required>
                            <option value="" disabled>Select Event...</option>
                            {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                        </select>
                        <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md flex items-center justify-center transition-colors">
                            <CheckCircle className="w-5 h-5 mr-2" /> Mark Attendance
                        </button>
                    </form>
                    {manualCheckinResult && (
                        <div className={`mt-4 p-4 rounded-2xl text-sm font-bold flex items-center border ${manualCheckinResult.success ? 'bg-emerald-100 text-emerald-900 border-emerald-200' : 'bg-rose-100 text-rose-900 border-rose-200'}`}>
                            {manualCheckinResult.success ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
                            {manualCheckinResult.message}
                        </div>
                    )}
                </motion.div>
            </div>
            {/* --- END ATTENDANCE TRACKING SECTION --- */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Create Event Form */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100/50 h-fit sticky top-24">
                    <h2 className="text-2xl font-black text-emerald-950 mb-6 flex items-center">
                        <Plus className="w-6 h-6 mr-3 text-emerald-600" /> Coordinate Event
                    </h2>
                    
                    {idealDates && (
                        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 flex items-start group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                            <Sparkles className="w-5 h-5 text-emerald-600 mr-3 mt-0.5" />
                            <div className="relative z-10">
                                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-1.5">AI Suggestion</p>
                                <p className="text-sm text-emerald-900/80 mb-3 font-medium">Based on predictive modeling, <span className="font-bold text-emerald-950">{idealDates.idealDays?.[0]}</span> at <span className="font-bold text-emerald-950">{idealDates.idealTimes?.[0]}</span> yields the highest turnout.</p>
                                <button onClick={applyIdealSuggestion} className="text-xs font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest underline decoration-2 underline-offset-4">Apply Time</button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleCreateEvent} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Title</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Event title" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Description</label>
                            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-medium" rows="3" placeholder="Event description"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-emerald-900 mb-2">Date</label>
                                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-emerald-900 mb-2">Time</label>
                                <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Location</label>
                            <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Event location" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Category</label>
                            <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none">
                                <option value="General">General</option>
                                <option value="Academic">Academic</option>
                                <option value="Sports">Sports</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Technology">Technology</option>
                                <option value="Social">Social</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-emerald-900 mb-2">Tags (comma-separated)</label>
                            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., workshop, seminar" className="w-full px-5 py-3.5 border-0 bg-emerald-50/50 rounded-2xl shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                        </div>
                        <button type="submit" className="w-full mt-6 flex justify-center items-center py-4 px-4 rounded-2xl shadow-md text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 transition">
                            <Sparkles className="w-4 h-4 mr-2" /> Publish Event
                        </button>
                    </form>
                </div>

                {/* Event List */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-black text-emerald-950 flex items-center tracking-tight">
                            <CalendarIcon className="w-7 h-7 mr-3 text-emerald-600" /> Managed Events
                        </h2>
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-4 w-4 text-emerald-400" /></div>
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 shadow-sm focus:ring-2 focus:ring-emerald-500 text-sm font-bold bg-white" />
                        </div>
                    </div>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {filteredEvents.length === 0 ? (
                            <div className="col-span-full text-center py-16 bg-white rounded-[2rem] border border-emerald-50 shadow-sm">
                                <CalendarIcon className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                                <p className="text-emerald-900/60 font-medium">No events found.</p>
                            </div>
                        ) : (
                            filteredEvents.map(event => {
                                const forecast = getForecastForEvent(event._id);
                                return (
                                    <motion.div key={event._id} variants={cardVariants} whileHover={{ scale: 1.02, y: -5 }} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] border border-emerald-50 flex flex-col transition-all group">
                                        <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black text-white bg-gradient-to-r ${getCategoryColor(event.category)} mb-6 w-fit shadow-md`}>{event.category || 'General'}</div>
                                        <h3 className="text-xl font-black text-emerald-950 mb-3 leading-tight group-hover:text-emerald-700 transition-colors">{event.title}</h3>
                                        <p className="text-sm text-slate-500 mb-6 flex-grow line-clamp-2 font-medium">{event.description}</p>
                                        
                                        <div className="text-xs font-bold text-emerald-800 space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 mb-6 group-hover:bg-emerald-50 transition-colors">
                                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-emerald-600" /> <span>{event.location}</span></div>
                                            <div className="flex items-center"><Calendar className="w-4 h-4 mr-3 text-emerald-600" /> <span>{new Date(event.date).toLocaleDateString()}</span></div>
                                            <div className="flex items-center"><Clock className="w-4 h-4 mr-3 text-emerald-600" /> <span>{event.time || 'TBD'}</span></div>
                                            <div className="flex items-center"><Users className="w-4 h-4 mr-3 text-emerald-600" /> <span>{event.attendees?.length || 0} registered</span></div>
                                        </div>

                                        {/* AI Forecast Section */}
                                        {forecast && (
                                            <div className="mt-auto bg-gradient-to-r from-teal-50 to-emerald-50 p-5 rounded-2xl border border-teal-100 flex items-center shadow-inner group-hover:shadow-none transition-shadow">
                                                <TrendingUp className="w-6 h-6 text-teal-600 mr-4 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-0.5">AI Forecast</p>
                                                    <p className="text-sm font-black text-teal-900">{forecast.forecastedAttendees} Est. Attendees</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
