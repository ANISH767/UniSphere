import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Users, Plus, Crown, UserPlus, Shield, Sparkles, Heart } from 'lucide-react';

function Clubs() {
    const [clubs, setClubs] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const response = await axios.get('https://unisphere-api-9j0u.onrender.com/api/clubs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClubs(response.data);
        } catch (error) {
            console.error("Error fetching clubs", error);
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://unisphere-api-9j0u.onrender.com/api/clubs', {
                name, description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchClubs();
            setName(''); setDescription('');
        } catch (error) {
            console.error("Error creating club", error);
            alert(error.response?.data?.message || 'Failed to create club. Only admins can create clubs.');
        }
    };

    const handleJoinClub = async (clubId) => {
        try {
            const response = await axios.post(`https://unisphere-api-9j0u.onrender.com/api/clubs/${clubId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(response.data.message);
            fetchClubs(); // Refresh to show updated member count
        } catch (error) {
            console.error("Error joining club", error);
            alert(error.response?.data?.message || 'Failed to join club');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
            <Navbar />

            <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Campus Clubs
                    </h1>
                    <p className="text-gray-600">Discover and join clubs that match your interests</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Create Club Form */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                            Create a Club
                        </h2>
                        <form onSubmit={handleCreateClub} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter club name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" rows="3" placeholder="Describe your club's purpose"></textarea>
                            </div>
                            <button type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Create Club
                            </button>
                            <div className="flex items-center justify-center text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                                <Shield className="w-3 h-3 mr-1" />
                                Only Admins can create clubs
                            </div>
                        </form>
                    </div>

                    {/* Club List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <Users className="w-6 h-6 mr-2 text-indigo-600" />
                            All Clubs
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {clubs.length === 0 ? (
                                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No clubs found yet. Be the first to create one!</p>
                                </div>
                            ) : (
                                clubs.map(club => (
                                    <div key={club._id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col hover:shadow-xl transition transform hover:scale-[1.02]">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{club.name}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{club.description || 'No description provided.'}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg ml-3">
                                                <Crown className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-2 mb-4">
                                            <div className="flex items-center">
                                                <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                                                <span>President: {club.president?.Name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-indigo-500" />
                                                <span>{club.members?.length || 0} members</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleJoinClub(club._id)}
                                            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-md flex items-center justify-center"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Join Club
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Clubs;
