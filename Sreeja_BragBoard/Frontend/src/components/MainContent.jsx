import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const MainContent = ({ activeView, selectedDepartment }) => {
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
  const [users, setUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [myShoutouts, setMyShoutouts] = useState({ given: [], received: [] });
  const [loadingMyShoutouts, setLoadingMyShoutouts] = useState(true);

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
  }, [activeView, fetchUsers, fetchShoutOuts]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title.trim() || !formData.message.trim() || !formData.receiver_id) {
      setErrorMessage('Please fill in all required fields');
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

      setSuccessMessage('Shout-out created successfully!');
      setFormData({
        title: '',
        message: '',
        receiver_id: '',
        category: 'teamwork',
        is_public: 'public',
        file: null
      });
      setImagePreview(null);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchShoutOuts();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create shout-out');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Shout-Out Feed</h2>
              <p className="text-gray-600">
                {selectedDepartment === 'all'
                  ? 'Showing shout-outs from all departments'
                  : `Showing shout-outs from ${selectedDepartment} department`}
              </p>
            </div>

            {/* Create Shout-Out Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create Shout-Out</h3>
              
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🎉 {shoutOuts.length} Shout-Out{shoutOuts.length !== 1 ? 's' : ''}
              </h3>
              
              {loading ? (
                <p className="text-gray-600">Loading shout-outs...</p>
              ) : shoutOuts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 mb-2">No Shout-Outs Yet</p>
                  <p className="text-gray-500">Be the first to spread some positivity!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shoutOuts.map(shoutout => (
                    <div key={shoutout.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{shoutout.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            From: <span className="font-semibold">{shoutout.giver_name}</span> ({shoutout.giver_department})
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            To: <span className="font-semibold">{shoutout.receiver_name}</span> ({shoutout.receiver_department})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {shoutout.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{shoutout.message}</p>
                      {shoutout.image_url && (
                        <div className="mb-2">
                          <img
                            src={`http://127.0.0.1:8000${shoutout.image_url}`}
                            alt="Shoutout attachment"
                            className="max-w-sm rounded-lg shadow-md"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {shoutout.is_public === 'public' && '🌍 Public'}
                          {shoutout.is_public === 'department_only' && '🏢 Department Only'}
                          {shoutout.is_public === 'private' && '🔒 Private'}
                        </span>
                        <span>{new Date(shoutout.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics</h2>
              <p className="text-gray-600">Detailed analytics and insights</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Detailed analytics and insights will be available in a future update.</p>
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
    </div>
  );
};

export default MainContent;
