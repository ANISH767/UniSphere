import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', academicInterests: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setFormData({
          name: res.data.name,
          academicInterests: res.data.academicInterests?.join(', ') || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const interestsArray = formData.academicInterests
        .split(',')
        .map(i => i.trim())
        .filter(i => i !== '');

      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        { name: formData.name, academicInterests: interestsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-12 text-center relative">
          <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            {user?.role || 'User'}
          </div>
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white text-blue-600 text-3xl font-bold shadow-md border-4 border-white/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
          <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Content Tabs / Sections */}
        <div className="p-6 sm:p-8">
          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Account Statistics</h3>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-gray-50 px-4 py-5 rounded-xl border border-gray-100">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</dt>
                    <dd className="mt-1 text-sm font-semibold text-green-600 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span> Active
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 rounded-xl border border-gray-100">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Campus</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 rounded-xl border border-gray-100">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</dt>
                    <dd className="mt-1 text-sm font-semibold text-blue-600">Official Portal Verified</dd>
                  </div>
                </dl>
              </div>

              {/* Dynamic Role-Based Data */}
              {user?.role === 'student' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Academic Core & Interests</h3>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Configured Recommender Filters</p>
                    {user?.academicInterests && user.academicInterests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.academicInterests.map((interest, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No academic interests selected yet. Update your profile to customize your dashboard recommendation loop.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                >
                  Edit Profile Fields
                </button>
              </div>
            </div>
          ) : (
            /* Editing Form Mode */
            <form onSubmit={handleUpdate} className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Modify Display Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>

                {user?.role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Focus Areas</label>
                    <input
                      type="text"
                      value={formData.academicInterests}
                      onChange={(e) => setFormData({ ...formData, academicInterests: e.target.value })}
                      placeholder="e.g., Cloud Computing, DevOps, Web3, Blockchain"
                      className="mt-1 block w-full px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">Separate values with commas to feed the AI recommendation configuration pipeline.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;