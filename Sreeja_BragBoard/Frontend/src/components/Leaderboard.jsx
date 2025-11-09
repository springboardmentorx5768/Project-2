import { useState, useEffect } from 'react';
import api from '../services/api';

const LeaderboardCard = ({ title, data }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <span className={`
              w-8 h-8 flex items-center justify-center rounded-full
              ${index === 0 ? 'bg-yellow-400 text-white' :
                index === 1 ? 'bg-gray-300 text-gray-800' :
                index === 2 ? 'bg-amber-600 text-white' :
                'bg-gray-200 text-gray-600'}
            `}>
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">{item.department}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">{item.count}</p>
            <p className="text-sm text-gray-500">
              {title.includes('Given') ? 'Given' : 'Received'}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Leaderboard = () => {
  const [topGivers, setTopGivers] = useState([]);
  const [topReceivers, setTopReceivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const [contributorsData, receiverData] = await Promise.all([
          api.getTopContributors(10), // Top 10 givers
          api.getTopReceivers(10)     // Top 10 receivers
        ]);
        
        setTopGivers(contributorsData);
        setTopReceivers(receiverData);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Appreciation Leaderboard</h2>
        <p className="text-gray-600">Recognizing our top contributors and most appreciated team members</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LeaderboardCard title="Top Appreciation Givers" data={topGivers} />
        <LeaderboardCard title="Most Appreciated Members" data={topReceivers} />
      </div>
    </div>
  );
};

export default Leaderboard;