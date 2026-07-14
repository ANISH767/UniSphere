import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutGrid, Users, User, LogOut, Home, Calendar } from 'lucide-react';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const linkClass = (path) =>
        `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            location.pathname === path
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <nav className="bg-white/80 backdrop-blur-lg shadow-lg px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
            <div className="flex items-center space-x-8">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        UniSphere
                    </h1>
                </Link>
                <div className="flex items-center space-x-2">
                    <Link to="/dashboard" className={linkClass('/dashboard')}>
                        <LayoutGrid className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <Link to="/events" className={linkClass('/events')}>
                        <Calendar className="w-4 h-4" />
                        Events
                    </Link>
                    <Link to="/clubs" className={linkClass('/clubs')}>
                        <Users className="w-4 h-4" />
                        Clubs
                    </Link>
                    <Link to="/profile" className={linkClass('/profile')}>
                        <User className="w-4 h-4" />
                        Profile
                    </Link>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Link 
                    to="/" 
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 flex items-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    Home
                </Link>
                <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 transform hover:scale-[1.02]"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
