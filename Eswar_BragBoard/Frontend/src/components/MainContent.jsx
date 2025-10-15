import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const MainContent = ({ activeView, selectedDepartment, user }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} />
      case 'create':
        return <CreateShoutOut user={user} />
      case 'my-shoutouts':
        return <MyShoutOuts user={user} />
      case 'analytics':
        return <Analytics user={user} />
      default:
        return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} />
    }
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </main>
  )
}

// Shout-Out Feed Component
const ShoutOutFeed = ({ selectedDepartment, user }) => {
  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Shout-Out Feed
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedDepartment === 'all' 
                ? 'Showing shout-outs from all departments' 
                : `Showing shout-outs from ${selectedDepartment} department`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              🎉 0 Shout-Outs
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Shout-Outs Yet</h3>
        <p className="text-gray-600 mb-6">
          Be the first to spread some positivity! Create a shout-out to appreciate your colleagues.
        </p>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
          Create Your First Shout-Out
        </button>
      </div>
    </div>
  )
}

// Create Shout-Out Component
const CreateShoutOut = ({ user }) => {
  const [message, setMessage] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('all')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const data = await api.searchUsers({ department, search })
        if (!cancelled) setResults(data)
      } catch (e) {
        if (!cancelled) setResults([])
      }
    }
    run()
    return () => { cancelled = true }
  }, [department, search])

  const addRecipient = (u) => {
    if (!selected.find(x => x.id === u.id)) {
      setSelected([...selected, u])
    }
  }

  const removeRecipient = (id) => {
    setSelected(selected.filter(x => x.id !== id))
  }

  const canSubmit = useMemo(() => {
    return message.trim() && selected.length > 0
  }, [message, selected])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await api.createShoutOutMulti({
        message: message.trim(),
        recipient_ids: selected.map(s => s.id),
        is_public: visibility,
      })
      setMessage('')
      setSelected([])
      setSuccess('Shout-out created successfully')
    } catch (e) {
      setError(e.message || 'Failed to create shout-out')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
          Create Shout-Out
        </h2>

        {error ? (
          <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>
        ) : null}
        {success ? (
          <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{success}</div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Category removed as requested */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Write your appreciation message..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <select value={visibility} onChange={(e)=>setVisibility(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="public">Public</option>
                <option value="department_only">Department Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Recipients</label>
              <div className="flex gap-2">
                <select value={department} onChange={(e)=>setDepartment(e.target.value)} className="border rounded-lg px-2 py-2">
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                </select>
                <input value={search} onChange={(e)=>setSearch(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Type a name..." />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Search Results</div>
              <div className="max-h-40 overflow-auto divide-y">
                {results.map(u => (
                  <button key={u.id} type="button" onClick={()=>addRecipient(u)} className="w-full text-left px-2 py-2 hover:bg-gray-50">
                    {u.name} <span className="text-gray-500 text-xs">({u.department})</span>
                  </button>
                ))}
                {!results.length && <div className="text-gray-500 text-sm px-2 py-2">No users</div>}
              </div>
            </div>
            <div className="border rounded-xl p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Selected Recipients</div>
              <div className="flex flex-wrap gap-2">
                {selected.map(u => (
                  <span key={u.id} className="inline-flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                    {u.name}
                    <button type="button" onClick={()=>removeRecipient(u.id)} className="ml-2 text-indigo-600 hover:text-indigo-800">×</button>
                  </span>
                ))}
                {!selected.length && <div className="text-gray-500 text-sm">No recipients selected</div>}
              </div>
            </div>
          </div>

          <div>
            <button disabled={!canSubmit || submitting} className="bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
              {submitting ? 'Submitting...' : 'Create Shout-Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// My Shout-Outs Component
const MyShoutOuts = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
          My Shout-Outs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Shout-Outs Given</h3>
            <div className="text-3xl font-bold text-green-700 mb-2">0</div>
            <p className="text-green-600 text-sm">Appreciations you've shared</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Shout-Outs Received</h3>
            <div className="text-3xl font-bold text-blue-700 mb-2">0</div>
            <p className="text-blue-600 text-sm">Appreciations you've received</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Analytics Component
const Analytics = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
          Analytics Dashboard
        </h2>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Analytics Coming Soon!</h3>
          <p className="text-purple-700">
            Detailed analytics and insights will be available in Week 7-8 of the project timeline.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MainContent
