import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Analytics from './Analytics';
import ActivityLog from './ActivityLog';
import ReactionButtons from './ReactionButtons';
import Comments from './Comments';

const MainContent = ({ activeView, setActiveView, selectedDepartment, user }) => {
  // Additional state for filters and image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [shoutOuts, setShoutOuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    receiver_id: '',
    category: 'teamwork',
    is_public: 'public',
    file: null
  });
  const [filters, setFilters] = useState({
    senderSearch: '',
    startDate: '',
    endDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [users, setUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [myShoutouts, setMyShoutouts] = useState({ given: [], received: [] });
  const [loadingMyShoutouts, setLoadingMyShoutouts] = useState(true);
  const [departmentStats, setDepartmentStats] = useState({ total_shoutouts: 0, given: 0, received: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState({ top_givers: [], top_receivers: [] });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastApiError, setLastApiError] = useState(null);

  // Fetch my shoutouts when activeView changes to 'my-shoutouts'
  useEffect(() => {
    const fetchMyShoutouts = async () => {
      if (activeView !== 'my-shoutouts') return;
      
      setLoadingMyShoutouts(true);
      try {
        const [given, received] = await Promise.all([
          api.getMyShoutouts('given'),
          api.getMyShoutouts('received')
        ]);
        setMyShoutouts({ given, received });
      } catch (error) {
        console.error('Error fetching my shoutouts:', error);
        setErrorMessage('Failed to load your shoutouts');
      } finally {
        setLoadingMyShoutouts(false);
      }
    };

    fetchMyShoutouts();
  }, [activeView]);

  // Debug: Log whenever departmentStats changes
  useEffect(() => {
    console.log('📈 departmentStats state updated:', departmentStats);
  }, [departmentStats]);

  // Fetch users and shoutouts
  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users for department:', selectedDepartment);
      const data = await api.searchUsers(selectedDepartment);
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users list');
    }
  }, [selectedDepartment]);

  const fetchShoutOuts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getShoutoutsFeed({
        department: selectedDepartment,
        senderId: filters.senderSearch ? parseInt(filters.senderSearch) : null,
        startDate: filters.startDate ? new Date(filters.startDate) : null,
        endDate: filters.endDate ? new Date(filters.endDate) : null
      });
      setShoutOuts(data);
    } catch (error) {
      console.error('Error fetching shout-outs:', error);
      setErrorMessage('Failed to load shoutouts');
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment, filters.senderSearch, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchUsers();
    if (activeView === 'feed') {
      fetchShoutOuts();
    }
    if (activeView === 'dashboard' || activeView === 'analytics') {
      fetchMyStats();
      fetchCurrentUser();
      fetchShoutOuts(); // Fetch shoutouts for recent activity
    }
    if (activeView === 'users') {
      fetchAllUsers();
    }
    if (activeView === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeView, fetchUsers, fetchShoutOuts]);

  // Fetch user's personal stats
  const fetchMyStats = async () => {
    console.log('🔍 fetchMyStats() called');
    console.log('🔑 Access token exists:', !!localStorage.getItem('access_token'));
    setLastApiError(null); // Clear previous error
    try {
      console.log('📡 Calling api.getMyStats()...');
      const data = await api.getMyStats();
      console.log('✅ Received stats data:', data);
      console.log('📊 Stats breakdown:', {
        total: data?.total_shoutouts,
        given: data?.given,
        received: data?.received
      });
      
      // Ensure we have valid data before setting state
      if (data && typeof data === 'object') {
        setDepartmentStats({
          total_shoutouts: data.total_shoutouts || 0,
          given: data.given || 0,
          received: data.received || 0
        });
        console.log('✅ Stats updated in state:', {
          total_shoutouts: data.total_shoutouts || 0,
          given: data.given || 0,
          received: data.received || 0
        });
        setSuccessMessage(`Stats loaded! Given: ${data.given}, Received: ${data.received}`);
      } else {
        console.error('❌ Invalid data format received:', data);
        const errMsg = 'Invalid stats data received from server';
        setErrorMessage(errMsg);
        setLastApiError(errMsg);
      }
    } catch (error) {
      console.error('❌ Error fetching my stats:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      const errMsg = `Failed to load stats: ${error.message}`;
      setErrorMessage(errMsg);
      setLastApiError(errMsg);
    }
  };

  // Fetch department stats (for analytics)
  const fetchDepartmentStats = async () => {
    try {
      const data = await api.getDepartmentStats();
      setDepartmentStats(data);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      const data = await api.getUserProfile();
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch all users (admin only)
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getAllUsers();
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setErrorMessage('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Delete user (admin only)
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.deleteUser(userId);
      setSuccessMessage('✅ User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchAllUsers();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete user');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await api.getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (name.startsWith('filter_')) {
      const filterName = name.replace('filter_', '');
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Negative content filter
  const containsNegativeContent = (text) => {
    const negativeWords = [
      'hate', 'stupid', 'idiot', 'dumb', 'terrible', 'awful', 'worst',
      'useless', 'pathetic', 'horrible', 'disgusting', 'incompetent',
      'failure', 'loser', 'trash', 'garbage', 'sucks', 'bad', 'poor'
    ];
    const lowerText = text.toLowerCase();
    return negativeWords.some(word => lowerText.includes(word));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title.trim() || !formData.message.trim() || !formData.receiver_id) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Check for negative content
    if (containsNegativeContent(formData.title) || containsNegativeContent(formData.message)) {
      setErrorMessage('❌ Negative or inappropriate content detected! Please keep shout-outs positive and encouraging.');
      return;
    }

    try {
      await api.createShoutout({
        title: formData.title,
        message: formData.message,
        receiver_id: parseInt(formData.receiver_id),
        category: formData.category,
        is_public: formData.is_public,
        file: formData.file
      });

      setSuccessMessage('🎉 Shout-out created successfully!');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      setFormData({
        title: '',
        message: '',
        receiver_id: '',
        category: 'teamwork',
        is_public: 'public',
        file: null
      });
      setImagePreview(null);
      setTimeout(() => setSuccessMessage(''), 5000); // Increased to 5 seconds
      fetchShoutOuts();
      fetchMyStats(); // Update stats after creating shoutout
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create shout-out');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // Delete shoutout function
  const handleDeleteShoutout = async (shoutoutId) => {
    if (!window.confirm('Are you sure you want to delete this shout-out?')) {
      return;
    }

    try {
      await api.deleteShoutout(shoutoutId);
      setSuccessMessage('✅ Shout-out deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      fetchShoutOuts();
      fetchMyStats(); // Update stats after deleting shoutout
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete shout-out');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Shout-Out Feed</h2>
              <p className="text-sm text-gray-600">
                {selectedDepartment === 'all'
                  ? 'Celebrating excellence across all departments'
                  : `Highlighting ${selectedDepartment} department achievements`}
              </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm shadow-sm animate-fadeInUp">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm animate-fadeInUp">
                {errorMessage}
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search shoutouts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Sort Dropdown */}
                <div className="md:w-48">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Create Shout-Out Form */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Shout-Out</h3>
              
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded text-sm mb-4">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Filter Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Shoutouts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sender Name</label>
                      <input
                        type="text"
                        name="filter_senderSearch"
                        value={filters.senderSearch}
                        onChange={handleInputChange}
                        placeholder="Search by sender..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        name="filter_startDate"
                        value={filters.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        name="filter_endDate"
                        value={filters.endDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Great work on the project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write your appreciation message..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Receiver */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send to <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="receiver_id"
                    value={formData.receiver_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a colleague</option>
                    {users && users.length > 0 ? (
                      users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No colleagues available in this department</option>
                    )}
                  </select>
                  {selectedDepartment === 'all' && (
                    <p className="mt-1 text-sm text-gray-500">
                      Tip: Select a specific department to see colleagues from that department
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="teamwork">Teamwork</option>
                    <option value="innovation">Innovation</option>
                    <option value="leadership">Leadership</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="problem_solving">Problem Solving</option>
                    <option value="mentorship">Mentorship</option>
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="is_public"
                    value={formData.is_public}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">🌍 Public (Everyone can see)</option>
                    <option value="department_only">🏢 Department Only</option>
                    <option value="private">🔒 Private</option>
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach Image (Optional)
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.file && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Selected file: {formData.file.name}
                      </p>
                      {imagePreview && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, file: null }));
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Create Your First Shout-Out
                </button>
              </form>
            </div>

            {/* Shout-Outs Feed */}
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
              {/* Shout-Outs Display Section */}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {(() => {
                  // Filter and sort shoutouts
                  let filteredShoutouts = shoutOuts;
                  
                  // Apply search filter
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filteredShoutouts = filteredShoutouts.filter(shoutout =>
                      shoutout.title.toLowerCase().includes(query) ||
                      shoutout.message.toLowerCase().includes(query) ||
                      shoutout.giver_name.toLowerCase().includes(query) ||
                      shoutout.receiver_name.toLowerCase().includes(query)
                    );
                  }
                  
                  // Apply sort
                  const sortedShoutouts = [...filteredShoutouts].sort((a, b) => {
                    const dateA = new Date(a.created_at);
                    const dateB = new Date(b.created_at);
                    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                  });
                  
                  return `${sortedShoutouts.length} Shout-Out${sortedShoutouts.length !== 1 ? 's' : ''}`;
                })()}
              </h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="spinner w-10 h-10 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-3">Loading shout-outs...</p>
                </div>
              ) : (() => {
                // Filter and sort shoutouts
                let filteredShoutouts = shoutOuts;
                
                // Apply search filter
                if (searchQuery.trim()) {
                  const query = searchQuery.toLowerCase();
                  filteredShoutouts = filteredShoutouts.filter(shoutout =>
                    shoutout.title.toLowerCase().includes(query) ||
                    shoutout.message.toLowerCase().includes(query) ||
                    shoutout.giver_name.toLowerCase().includes(query) ||
                    shoutout.receiver_name.toLowerCase().includes(query)
                  );
                }
                
                // Apply sort
                const sortedShoutouts = [...filteredShoutouts].sort((a, b) => {
                  const dateA = new Date(a.created_at);
                  const dateB = new Date(b.created_at);
                  return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                });

                if (sortedShoutouts.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-base text-gray-600 font-medium mb-1">
                        {searchQuery ? 'No matching shout-outs found' : 'No Shout-Outs Yet'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'Try a different search term' : 'Be the first to spread some positivity!'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {sortedShoutouts.map(shoutout => (
                      <div key={shoutout.id} className="shoutout-card">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900 mb-2">
                              {shoutout.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                From: {shoutout.giver_name}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                To: {shoutout.receiver_name}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                                {shoutout.receiver_department}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-3">
                            <span className="badge badge-primary text-xs">
                              {shoutout.category.replace('_', ' ')}
                            </span>
                            <button
                              onClick={() => handleDeleteShoutout(shoutout.id)}
                              className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 leading-relaxed">{shoutout.message}</p>
                        </div>
                        
                        {shoutout.image_url && (
                          <div className="mb-3">
                            <img
                              src={`http://127.0.0.1:8000${shoutout.image_url}`}
                              alt="Shoutout attachment"
                              className="max-w-xs rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                            shoutout.is_public === 'public' ? 'bg-emerald-50 text-emerald-700' :
                            shoutout.is_public === 'department_only' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {shoutout.is_public === 'public' && '🌍 Public'}
                            {shoutout.is_public === 'department_only' && '🏢 Department'}
                            {shoutout.is_public === 'private' && '🔒 Private'}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(shoutout.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        {/* Reactions */}
                        <ReactionButtons
                          shoutoutId={shoutout.id}
                          initialCounts={{
                            like_count: shoutout.like_count || 0,
                            clap_count: shoutout.clap_count || 0,
                            star_count: shoutout.star_count || 0
                          }}
                          initialUserReaction={shoutout.user_reaction}
                          onReactionChange={(id, reaction, counts) => {
                            // Update the shoutout in state with new reaction counts
                            setShoutOuts(prev => prev.map(s => 
                              s.id === id 
                                ? { ...s, ...counts, user_reaction: reaction }
                                : s
                            ));
                          }}
                        />

                        {/* Comments */}
                        <Comments
                          shoutoutId={shoutout.id}
                          currentUser={user}
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        );

      case 'my-shoutouts':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">My Shout-Outs</h2>
              <p className="text-gray-600">Appreciations you've shared and received</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              {loadingMyShoutouts ? (
                <div className="text-center py-4">Loading your shoutouts...</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{myShoutouts.given.length}</p>
                    <p className="text-gray-600">Appreciations you've shared</p>
                  </div>
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{myShoutouts.received.length}</p>
                    <p className="text-gray-600">Appreciations you've received</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Display Given Shoutouts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Shoutouts You've Given</h3>
              {myShoutouts.given.length === 0 ? (
                <p className="text-gray-600 text-center py-4">You haven't given any shoutouts yet</p>
              ) : (
                <div className="space-y-4">
                  {myShoutouts.given.map(shoutout => (
                    <div key={shoutout.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-bold text-gray-800">{shoutout.title}</h4>
                      <p className="text-sm text-gray-600">To: {shoutout.receiver_name}</p>
                      <p className="text-gray-700 mt-2">{shoutout.message}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(shoutout.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Display Received Shoutouts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Shoutouts You've Received</h3>
              {myShoutouts.received.length === 0 ? (
                <p className="text-gray-600 text-center py-4">You haven't received any shoutouts yet</p>
              ) : (
                <div className="space-y-4">
                  {myShoutouts.received.map(shoutout => (
                    <div key={shoutout.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-bold text-gray-800">{shoutout.title}</h4>
                      <p className="text-sm text-gray-600">From: {shoutout.giver_name}</p>
                      <p className="text-gray-700 mt-2">{shoutout.message}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(shoutout.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6 animate-fadeInUp">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    📊 Dashboard Overview
                  </h2>
                  <p className="text-primary-50">Welcome back! Here's your performance summary</p>
                </div>
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    fetchMyStats();
                  }}
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Stats
                </button>
              </div>
            </div>

            {/* Stats Grid - Consistent Primary/Secondary Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Shoutouts */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6 border-2 border-primary-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-primary-700 mb-1">
                  {departmentStats?.total_shoutouts || 0}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Total Shout-Outs</p>
              </div>

              {/* Given Shoutouts */}
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl shadow-lg p-6 border-2 border-secondary-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-secondary-700 mb-1">
                  {departmentStats?.given || 0}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Shout-Outs Given</p>
              </div>

              {/* Received Shoutouts */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-lg p-6 border-2 border-primary-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-primary-700 mb-1">
                  {departmentStats?.received || 0}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Shout-Outs Received</p>
              </div>

              {/* Department */}
              <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-xl shadow-lg p-6 border-2 border-secondary-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-secondary-500 to-primary-500 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-secondary-700 mb-1">
                  {currentUser?.department || 'N/A'}
                </h3>
                <p className="text-sm text-gray-600 font-medium">Your Department</p>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-r from-primary-500 to-secondary-500 w-1 h-6 rounded-full mr-3"></span>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {shoutOuts.slice(0, 5).map((shoutout) => (
                    <div key={shoutout.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">
                          {shoutout.giver_name} → {shoutout.receiver_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(shoutout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {shoutOuts.length === 0 && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 text-sm">No shout-outs yet</p>
                      <p className="text-gray-400 text-xs mt-1">Be the first to spread positivity!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-r from-secondary-500 to-primary-500 w-1 h-6 rounded-full mr-3"></span>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveView('create')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-all border-2 border-primary-200"
                  >
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Create Shout-Out</p>
                      <p className="text-xs text-gray-600">Recognize someone's work</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('feed')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-secondary-50 to-primary-50 rounded-lg hover:from-secondary-100 hover:to-primary-100 transition-all border-2 border-secondary-200"
                  >
                    <div className="bg-gradient-to-br from-secondary-500 to-primary-500 p-2 rounded-lg shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">View Feed</p>
                      <p className="text-xs text-gray-600">Browse all shout-outs</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('analytics')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-all border-2 border-primary-200"
                  >
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">View Analytics</p>
                      <p className="text-xs text-gray-600">Insights and trends</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-6 animate-fadeInUp">
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                🏆 Leaderboard
              </h2>
              <p className="text-primary-50">Top contributors spreading positivity</p>
            </div>

            {loadingLeaderboard ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Givers */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-primary-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Top Givers
                    </h3>
                    <p className="text-primary-100 text-sm">Most shout-outs given</p>
                  </div>
                  <div className="p-6">
                    {leaderboard.top_givers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <p>No data yet. Start giving shout-outs!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.top_givers.map((user, idx) => (
                          <div 
                            key={user.id}
                            className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                              idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md' :
                              idx === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300' :
                              idx === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300' :
                              'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' :
                              'bg-primary-100 text-primary-700'
                            }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : user.rank}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.department}</p>
                            </div>
                            
                            {/* Count Badge */}
                            <div className="flex-shrink-0">
                              <div className="bg-primary-500 text-white px-4 py-2 rounded-full font-bold shadow-md">
                                {user.count}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Receivers */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-secondary-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary-500 to-primary-500 p-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Top Receivers
                    </h3>
                    <p className="text-secondary-100 text-sm">Most shout-outs received</p>
                  </div>
                  <div className="p-6">
                    {leaderboard.top_receivers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <p>No data yet. Start receiving shout-outs!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.top_receivers.map((user, idx) => (
                          <div 
                            key={user.id}
                            className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                              idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-md' :
                              idx === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300' :
                              idx === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300' :
                              'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' :
                              'bg-secondary-100 text-secondary-700'
                            }`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : user.rank}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.department}</p>
                            </div>
                            
                            {/* Count Badge */}
                            <div className="flex-shrink-0">
                              <div className="bg-secondary-500 text-white px-4 py-2 rounded-full font-bold shadow-md">
                                {user.count}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'users':
        if (user?.role !== 'admin') {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h3>
                <p className="text-gray-600">You need admin privileges to access this page.</p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fadeInUp">
            {/* Users Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                👥 User Management
              </h2>
              <p className="text-primary-50">Manage all users in the system</p>
            </div>

            {/* Users Stats - Consistent Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6 border-2 border-primary-200 hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Total Users</p>
                    <h3 className="text-3xl font-bold text-primary-700">{allUsers.length}</h3>
                  </div>
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl shadow-lg p-6 border-2 border-secondary-200 hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Admins</p>
                    <h3 className="text-3xl font-bold text-secondary-700">
                      {allUsers.filter(u => u.role === 'admin').length}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-lg p-6 border-2 border-primary-200 hover:scale-105 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Employees</p>
                    <h3 className="text-3xl font-bold text-primary-700">
                      {allUsers.filter(u => u.role === 'employee').length}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-3 rounded-lg shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-primary-100 overflow-hidden">
              <div className="p-6 border-b-2 border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50">
                <h3 className="text-xl font-bold text-gray-800">All Users</h3>
              </div>
              
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-primary-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{u.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-300">
                              {u.department}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border-2 ${
                              u.role === 'admin' 
                                ? 'bg-secondary-100 text-secondary-800 border-secondary-300' 
                                : 'bg-primary-100 text-primary-800 border-primary-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(u.joined_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {u.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-danger-600 hover:text-danger-800 font-medium hover:bg-danger-50 px-3 py-1 rounded-lg border border-transparent hover:border-danger-300 transition-all"
                              >
                                Delete
                              </button>
                            )}
                            {u.id === user.id && (
                              <span className="text-gray-400 text-xs">You</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return <Analytics user={user} />;

      case 'activity':
        return <ActivityLog user={user} />;

      case 'department-activity':
        return (
          <div className="space-y-6 animate-fadeInUp">
            {/* Department Activity Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                📊 {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment.charAt(0).toUpperCase() + selectedDepartment.slice(1)} Activity
              </h2>
              <p className="text-primary-50">
                View all shoutouts and activity for {selectedDepartment === 'all' ? 'all departments' : `the ${selectedDepartment} department`}
              </p>
            </div>

            {/* Department Shoutouts */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 w-1 h-6 rounded-full mr-3"></span>
                Recent Activity
              </h3>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="spinner w-10 h-10 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-3">Loading activity...</p>
                </div>
              ) : (() => {
                // Filter shoutouts by department
                const departmentShoutouts = selectedDepartment === 'all' 
                  ? shoutOuts 
                  : shoutOuts.filter(s => 
                      s.giver_department?.toLowerCase() === selectedDepartment.toLowerCase() ||
                      s.receiver_department?.toLowerCase() === selectedDepartment.toLowerCase()
                    );

                if (departmentShoutouts.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-base text-gray-600 font-medium mb-1">No Activity Yet</p>
                      <p className="text-sm text-gray-500">
                        {selectedDepartment === 'all' ? 'No shoutouts have been created yet' : `No activity in the ${selectedDepartment} department yet`}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {departmentShoutouts
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map((shoutout) => (
                      <div key={shoutout.id} className="border-l-4 border-primary-500 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {shoutout.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs mb-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                From: {shoutout.giver_name}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                To: {shoutout.receiver_name}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-xs">
                                {shoutout.category.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">{shoutout.message}</p>
                        </div>
                        
                        {shoutout.image_url && (
                          <div className="mb-3">
                            <img
                              src={`http://127.0.0.1:8000${shoutout.image_url}`}
                              alt="Shoutout attachment"
                              className="max-w-xs rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(shoutout.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {(() => {
                                const now = new Date();
                                const created = new Date(shoutout.created_at);
                                const diffMs = now - created;
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMins / 60);
                                const diffDays = Math.floor(diffHours / 24);
                                
                                if (diffMins < 60) return `${diffMins} minutes ago`;
                                if (diffHours < 24) return `${diffHours} hours ago`;
                                return `${diffDays} days ago`;
                              })()}
                            </span>
                          </div>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            shoutout.is_public === 'public' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            shoutout.is_public === 'department_only' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {shoutout.is_public === 'public' && '🌍 Public'}
                            {shoutout.is_public === 'department_only' && '🏢 Department'}
                            {shoutout.is_public === 'private' && '🔒 Private'}
                          </span>
                        </div>

                        {/* Reactions */}
                        <ReactionButtons
                          shoutoutId={shoutout.id}
                          initialCounts={{
                            like_count: shoutout.like_count || 0,
                            clap_count: shoutout.clap_count || 0,
                            star_count: shoutout.star_count || 0
                          }}
                          initialUserReaction={shoutout.user_reaction}
                          onReactionChange={(id, reaction, counts) => {
                            setShoutOuts(prev => prev.map(s => 
                              s.id === id 
                                ? { ...s, ...counts, user_reaction: reaction }
                                : s
                            ));
                          }}
                        />

                        {/* Comments */}
                        <Comments
                          shoutoutId={shoutout.id}
                          currentUser={user}
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Department Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6 border-2 border-primary-200">
                <h4 className="text-sm text-gray-600 font-medium mb-2">Total Shoutouts</h4>
                <p className="text-3xl font-bold text-primary-700">
                  {selectedDepartment === 'all' 
                    ? shoutOuts.length 
                    : shoutOuts.filter(s => 
                        s.giver_department?.toLowerCase() === selectedDepartment.toLowerCase() ||
                        s.receiver_department?.toLowerCase() === selectedDepartment.toLowerCase()
                      ).length}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl shadow-lg p-6 border-2 border-secondary-200">
                <h4 className="text-sm text-gray-600 font-medium mb-2">Total Reactions</h4>
                <p className="text-3xl font-bold text-secondary-700">
                  {shoutOuts.reduce((acc, s) => 
                    acc + (s.like_count || 0) + (s.clap_count || 0) + (s.star_count || 0), 0
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-lg p-6 border-2 border-primary-200">
                <h4 className="text-sm text-gray-600 font-medium mb-2">Active Users</h4>
                <p className="text-3xl font-bold text-primary-700">
                  {new Set(shoutOuts.map(s => s.giver_id)).size}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a view from the navigation</div>;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-full bg-gray-50">
      {renderContent()}
      
      {/* Professional Success Notification */}
      {showCelebration && (
        <div className="success-notification z-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Shoutout Created Successfully</p>
              <p className="text-xs text-gray-600">Your appreciation has been shared</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
