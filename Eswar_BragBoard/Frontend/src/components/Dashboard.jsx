import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Dashboard = ({ user, onLogout }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeView, setActiveView] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-20 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed -bottom-8 right-20 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed -top-40 right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <Header 
          user={user} 
          onLogout={onLogout} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            userDepartment={user?.department}
            sidebarOpen={sidebarOpen}
          />

          {/* Main Content */}
          <MainContent
            activeView={activeView}
            setActiveView={setActiveView}
            selectedDepartment={selectedDepartment}
            user={user}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
