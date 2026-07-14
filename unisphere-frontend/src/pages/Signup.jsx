import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, GraduationCap, Brain, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [academicInterests, setAcademicInterests] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Send the new user data to your backend registration route
            await axios.post('https://unisphere-api-9j0u.onrender.com/api/auth/signup', {
                name,
                email,
                password,
                role,
                academicInterests: academicInterests.split(',').map(interest => interest.trim()).filter(interest => interest !== '')
            });

            // If successful, send them to the login page to sign in
            console.log("Registration successful!");
            navigate('/login');

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 absolute inset-0 z-50 overflow-y-auto"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Join UniSphere
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Create your account and start exploring campus events
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-blue-100">

                    <form className="space-y-6" onSubmit={handleSignup}>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="name" type="text" required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="email" type="email" required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="password" type="password" required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-1 text-gray-400" />
                                    Role
                                </div>
                            </label>
                            <div className="relative">
                                <select id="role" required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition bg-white"
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="academicInterests" className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center">
                                    <Brain className="h-4 w-4 mr-1 text-gray-400" />
                                    Academic Interests (comma-separated)
                                </div>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                                    <Sparkles className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="academicInterests" type="text"
                                    value={academicInterests}
                                    onChange={(e) => setAcademicInterests(e.target.value)}
                                    placeholder="e.g., Computer Science, Mathematics, Physics"
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500 flex items-center">
                                <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                                Used for AI-powered event recommendations
                            </p>
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition transform hover:scale-[1.02]">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create Account
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link to="/login" className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500 transition">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Signup;