import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import * as XLSX from 'xlsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = ({ user }) => {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    avgPerUser: 0,
    topDepartment: 'N/A'
  });
  const [topContributors, setTopContributors] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [response, contributors, departments] = await Promise.all([
        api.getShoutouts(),
        api.getTopContributors(),
        api.getDepartmentAnalytics()
      ]);
      setShoutouts(response);
      setTopContributors(contributors);
      setDepartmentStats(departments);
      calculateStats(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const thisMonth = data.filter(s => {
      const date = new Date(s.created_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    // Calculate department frequency
    const deptCount = {};
    data.forEach(s => {
      deptCount[s.receiver_department] = (deptCount[s.receiver_department] || 0) + 1;
    });
    const topDept = Object.entries(deptCount).sort((a, b) => b[1] - a[1])[0];

    setStats({
      total: data.length,
      thisMonth: thisMonth.length,
      avgPerUser: data.length > 0 ? (data.length / new Set(data.map(s => s.giver_id)).size).toFixed(1) : 0,
      topDepartment: topDept ? topDept[0] : 'N/A'
    });
  };

  // Monthly Trend Chart Data
  const getMonthlyTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyCounts = new Array(12).fill(0);

    shoutouts.forEach(shoutout => {
      const date = new Date(shoutout.created_at);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()]++;
      }
    });

    return {
      labels: months,
      datasets: [{
        label: 'Shoutouts per Month',
        data: monthlyCounts,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#667eea'
      }]
    };
  };

  // Department Comparison Chart
  const getDepartmentData = () => {
    const deptCount = {};
    shoutouts.forEach(s => {
      deptCount[s.receiver_department] = (deptCount[s.receiver_department] || 0) + 1;
    });

    const sortedDepts = Object.entries(deptCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      labels: sortedDepts.map(d => d[0]),
      datasets: [{
        label: 'Shoutouts Received',
        data: sortedDepts.map(d => d[1]),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
          'rgba(216, 180, 254, 0.8)'
        ],
        borderColor: [
          '#667eea',
          '#8b5cf6',
          '#a855f7',
          '#c084fc',
          '#d8b4fe'
        ],
        borderWidth: 2
      }]
    };
  };

  // Category Breakdown
  const getCategoryData = () => {
    const categoryCount = {};
    shoutouts.forEach(s => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });

    return {
      labels: Object.keys(categoryCount),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = shoutouts.map(s => ({
      Date: new Date(s.created_at).toLocaleDateString(),
      Giver: s.giver_name,
      Receiver: s.receiver_name,
      Department: s.receiver_department,
      Category: s.category,
      Message: s.message
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shoutouts');
    XLSX.writeFile(wb, `BragBoard_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Giver', 'Receiver', 'Department', 'Category', 'Message'];
    const rows = shoutouts.map(s => [
      new Date(s.created_at).toLocaleDateString(),
      s.giver_name,
      s.receiver_name,
      s.receiver_department,
      s.category,
      s.message.replace(/,/g, ';')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BragBoard_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 15
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

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
          <h2 className="text-3xl font-bold gradient-text mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export Excel
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Shoutouts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <p className="text-xs text-emerald-600 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.thisMonth}</p>
              <p className="text-xs text-blue-600 mt-1">Current period</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg per User</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgPerUser}</p>
              <p className="text-xs text-purple-600 mt-1">Engagement rate</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Top Department</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.topDepartment}</p>
              <p className="text-xs text-amber-600 mt-1">Most active</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
            </svg>
            Monthly Trends
          </h3>
          <div className="h-80">
            <Line data={getMonthlyTrendData()} options={chartOptions} />
          </div>
        </div>

        {/* Department Comparison */}
        <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Department Comparison
          </h3>
          <div className="h-80">
            <Bar data={getDepartmentData()} options={chartOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
            </svg>
            Category Breakdown
          </h3>
          <div className="h-80">
            <Doughnut 
              data={getCategoryData()} 
              options={{
                ...chartOptions,
                scales: undefined
              }} 
            />
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Top Contributors
          </h3>
          <div className="space-y-4 mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Given</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Received</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topContributors.map((user) => (
                    <tr key={user.user_id} className="border-t border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.shoutouts_given}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.shoutouts_received}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{user.engagement_score}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${(user.engagement_score / Math.max(...topContributors.map(u => u.engagement_score))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Department Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {departmentStats.map((dept) => (
              <div key={dept.department} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-base font-semibold text-gray-800 mb-3">{dept.department}</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total Shoutouts</span>
                      <span className="font-medium text-gray-900">{dept.total_shoutouts}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(dept.total_shoutouts / Math.max(...departmentStats.map(d => d.total_shoutouts))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div>
                      <span className="block font-medium">Internal</span>
                      <span>{dept.internal_shoutouts}</span>
                    </div>
                    <div>
                      <span className="block font-medium">External</span>
                      <span>{dept.external_shoutouts}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Ratio</span>
                      <span>
                        {dept.total_shoutouts
                          ? `${Math.round((dept.external_shoutouts / dept.total_shoutouts) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-elegant p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Shoutouts</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">From</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">To</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
              </tr>
            </thead>
            <tbody>
              {shoutouts.slice(0, 10).map((shoutout, index) => (
                <tr key={index} className="table-row border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(shoutout.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{shoutout.giver_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{shoutout.receiver_name}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="badge badge-primary">{shoutout.receiver_department}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="badge badge-success">{shoutout.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
