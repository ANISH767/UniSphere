import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetching the profile to check if user role is student, faculty, or admin
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setRole(res.data.role);
            } catch (err) {
                console.error("Failed to sync role profile", err);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg font-semibold text-gray-500 animate-pulse">
                    Synchronizing portal ecosystem...
                </div>
            </div>
        );
    }

    // Switches display dynamically according to verified database permissions
    switch (role) {
        case 'admin':
            return <AdminDashboard />;
        case 'faculty':
            return <FacultyDashboard />;
        case 'student':
        default:
            return <StudentDashboard />;
    }
}