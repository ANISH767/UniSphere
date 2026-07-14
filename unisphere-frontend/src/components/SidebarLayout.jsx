import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LayoutGrid, Calendar, Users, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SidebarLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/clubs', label: 'Clubs', icon: Users },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <motion.aside 
                animate={{ width: collapsed ? 80 : 260 }}
                className="bg-white/80 backdrop-blur-2xl border-r border-indigo-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-30 relative transition-all duration-300"
            >
                <div className="p-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200 min-w-[40px]">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent whitespace-nowrap">
                                UniSphere
                            </motion.h1>
                        )}
                    </Link>
                </div>

                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 bg-white border border-indigo-100 rounded-full p-1.5 shadow-md text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all z-40"
                >
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map(item => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${active ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-indigo-600 font-semibold'}`}>
                                {active && <motion.div layoutId="activeNav" className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-2xl -z-10"></motion.div>}
                                <item.icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500 transition-colors'}`} />
                                {!collapsed && <span className="whitespace-nowrap z-10">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-indigo-50">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 w-full transition-all group font-bold">
                        <LogOut className="w-5 h-5 shrink-0 text-rose-400 group-hover:text-rose-500 transition-colors" />
                        {!collapsed && <span className="whitespace-nowrap">Log Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
                
                {/* Top Nav (Sticky) */}
                <header className="h-[72px] bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 capitalize bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        <span className="text-slate-400">Platform</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="text-indigo-700 font-extrabold tracking-wide">{location.pathname.split('/')[1] || 'Dashboard'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </header>

                {/* Animated Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
