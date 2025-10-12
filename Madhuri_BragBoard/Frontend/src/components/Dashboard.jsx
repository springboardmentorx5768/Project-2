import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

const Dashboard = ({ user, onLogout }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [activeView, setActiveView] = useState('feed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header user={user} onLogout={onLogout} />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView}
          setActiveView={setActiveView}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          userDepartment={user?.department}
        />
        
        {/* Main Content */}
        <MainContent 
          activeView={activeView}
          selectedDepartment={selectedDepartment}
          user={user}
        />
      </div>
    </div>
  )
}

export default Dashboard
