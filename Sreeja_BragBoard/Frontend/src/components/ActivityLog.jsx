import { useState, useEffect } from 'react';
import api from '../services/api';

const ActivityLog = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, shoutouts, users, system
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    console.log('🔍 Fetching activity logs...');
    try {
      setLoading(true);
      const data = await api.getActivityLog();
      console.log('✅ Received activity logs:', data);
      console.log('📊 Total activities:', data?.length || 0);
      setActivities(data || []);
    } catch (error) {
      console.error('❌ Error fetching activity log:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'shoutout_created':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
            </svg>
          </div>
        );
      case 'user_registered':
        return (
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
        );
      case 'user_deleted':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"></path>
            </svg>
          </div>
        );
      case 'shoutout_deleted':
        return (
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  const formatActivityMessage = (activity) => {
    switch (activity.action_type) {
      case 'shoutout_created':
        return `${activity.user_name} created a shoutout for ${activity.details}`;
      case 'user_registered':
        return `${activity.user_name} registered as a new user`;
      case 'user_deleted':
        return `Admin deleted user: ${activity.details}`;
      case 'shoutout_deleted':
        return `${activity.user_name} deleted a shoutout`;
      default:
        return activity.details || 'Unknown activity';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all') {
      const typeMatch = filter === 'shoutouts' 
        ? activity.action_type.includes('shoutout')
        : filter === 'users'
        ? activity.action_type.includes('user')
        : true;
      if (!typeMatch) return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        activity.user_name?.toLowerCase().includes(searchLower) ||
        activity.details?.toLowerCase().includes(searchLower) ||
        activity.action_type?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Activity Audit Log</h2>
          <p className="text-gray-600">Track all system activities and user actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-elegant p-4 border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('shoutouts')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'shoutouts'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Shoutouts
            </button>
            <button
              onClick={() => setFilter('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'users'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500">No activities found</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <div key={index} className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-all duration-200">
                {getActivityIcon(activity.action_type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-gray-900 font-medium">{formatActivityMessage(activity)}</p>
                    <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`badge ${
                      activity.action_type.includes('delete') ? 'badge-warning' :
                      activity.action_type.includes('create') || activity.action_type.includes('register') ? 'badge-success' :
                      'badge-primary'
                    }`}>
                      {activity.action_type.replace('_', ' ')}
                    </span>
                    {activity.ip_address && (
                      <span className="text-xs text-gray-500">IP: {activity.ip_address}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <p className="text-gray-600 text-sm">Total Activities</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activities.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <p className="text-gray-600 text-sm">Shoutouts Created</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {activities.filter(a => a.action_type === 'shoutout_created').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <p className="text-gray-600 text-sm">New Registrations</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {activities.filter(a => a.action_type === 'user_registered').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
          <p className="text-gray-600 text-sm">Deletions</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {activities.filter(a => a.action_type.includes('delete')).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
