import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const MainContent = ({ activeView, setActiveView, selectedDepartment, user }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'feed':
        return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} setActiveView={setActiveView} />
      case 'create':
        return <CreateShoutOut user={user} />
      case 'my-shoutouts':
        return <MyShoutOuts user={user} />
      case 'analytics':
        return <Analytics user={user} />
      default:
        return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} setActiveView={setActiveView} />
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
const ShoutOutFeed = ({ selectedDepartment, user, setActiveView }) => {
  const [shoutouts, setShoutouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    sender: '',
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [reactions, setReactions] = useState({})
  const [reactingTo, setReactingTo] = useState(null)
  const [showReactionPicker, setShowReactionPicker] = useState(null)

  useEffect(() => {
    fetchShoutouts()
  }, [selectedDepartment, filters])

  useEffect(() => {
    // Fetch reactions for all shoutouts when shoutouts change or user changes
    if (shoutouts.length > 0) {
      fetchAllReactions()
    }
  }, [shoutouts, user])

  const fetchAllReactions = async () => {
    const reactionsData = {}
    for (const shoutout of shoutouts) {
      try {
        const data = await api.getReactions(shoutout.id)
        reactionsData[shoutout.id] = data.reactions
      } catch (e) {
        console.error(`Failed to fetch reactions for shoutout ${shoutout.id}:`, e)
      }
    }
    setReactions(reactionsData)
  }

  const fetchShoutouts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getFeed({
        department: selectedDepartment,
        sender: filters.sender,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      })
      setShoutouts(data)
    } catch (e) {
      setError(e.message || 'Failed to load shout-outs')
      setShoutouts([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ sender: '', dateFrom: '', dateTo: '' })
  }

  const handleDeleteShoutOut = async (shoutoutId) => {
    if (!window.confirm('Are you sure you want to delete this shout-out? This action cannot be undone.')) {
      return
    }

    setDeletingId(shoutoutId)
    try {
      await api.deleteShoutOut(shoutoutId)
      // Remove the deleted shout-out from the list
      setShoutouts(prev => prev.filter(s => s.id !== shoutoutId))
    } catch (e) {
      setError(e.message || 'Failed to delete shout-out')
    } finally {
      setDeletingId(null)
    }
  }

  const handleReaction = async (shoutoutId, reactionType) => {
    if (reactingTo === shoutoutId) return

    setReactingTo(shoutoutId)
    try {
      await api.addReaction(shoutoutId, reactionType)
      // Refresh reactions for this shoutout
      const data = await api.getReactions(shoutoutId)
      setReactions(prev => ({
        ...prev,
        [shoutoutId]: data.reactions
      }))
    } catch (e) {
      console.error('Failed to add reaction:', e)
    } finally {
      setReactingTo(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
              🎉 {shoutouts.length} Shout-Out{shoutouts.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={filters.sender}
                  onChange={(e) => handleFilterChange('sender', e.target.value)}
                  placeholder="Search by sender..."
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchShoutouts}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shout-outs...</p>
        </div>
      )}

      {/* Shout-Outs List */}
      {!loading && !error && shoutouts.length > 0 && (
        <div className="space-y-4">
          {shoutouts.map((shoutout) => (
            <div key={shoutout.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {shoutout.giver_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{shoutout.giver_name}</h3>
                    <p className="text-sm text-gray-500">{shoutout.giver_department}</p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <p className="text-sm text-gray-500">{formatDate(shoutout.created_at)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    shoutout.category === 'teamwork' ? 'bg-blue-100 text-blue-700' :
                    shoutout.category === 'innovation' ? 'bg-green-100 text-green-700' :
                    shoutout.category === 'leadership' ? 'bg-purple-100 text-purple-700' :
                    shoutout.category === 'customer_service' ? 'bg-orange-100 text-orange-700' :
                    shoutout.category === 'problem_solving' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {shoutout.category.replace('_', ' ')}
                  </span>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteShoutOut(shoutout.id)}
                      disabled={deletingId === shoutout.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                      title="Delete shout-out (Admin only)"
                    >
                      {deletingId === shoutout.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {shoutout.title && (
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{shoutout.title}</h4>
              )}

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{shoutout.message}</p>

              {shoutout.image_url && (
                <div className="mb-4">
                  <img
                    src={`http://127.0.0.1:8000${shoutout.image_url}`}
                    alt="Shout-out attachment"
                    className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {/* Always show all reaction options */}
                  {[
                    { type: 'thumbs_up', emoji: '👍', label: 'Like' },
                    { type: 'heart', emoji: '❤️', label: 'Love' },
                    { type: 'clap', emoji: '👏', label: 'Clap' },
                    { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
                    { type: 'insightful', emoji: '💡', label: 'Insightful' },
                    { type: 'support', emoji: '🤝', label: 'Support' }
                  ].map(({ type, emoji, label }) => {
                    // Find if this reaction type exists for this shoutout
                    const existingReaction = reactions[shoutout.id]?.find(r => r.type === type)
                    const count = existingReaction ? existingReaction.count : 0
                    const userReacted = existingReaction ? existingReaction.user_reacted : false

                    return (
                      <button
                        key={type}
                        onClick={() => handleReaction(shoutout.id, type)}
                        disabled={reactingTo === shoutout.id}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                          userReacted
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        } ${reactingTo === shoutout.id ? 'opacity-50' : ''}`}
                        title={label}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="font-medium">{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>To: {shoutout.receiver_name} ({shoutout.receiver_department})</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    shoutout.is_public === 'public' ? 'bg-green-100 text-green-700' :
                    shoutout.is_public === 'department_only' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {shoutout.is_public === 'public' ? 'Public' :
                     shoutout.is_public === 'department_only' ? 'Department Only' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && shoutouts.length === 0 && (
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
          <button onClick={() => setActiveView('create')} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
            Create Your First Shout-Out
          </button>
        </div>
      )}
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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB')
        return
      }

      setImageFile(file)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = null

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true)
        try {
          const uploadResult = await api.uploadImage(imageFile)
          imageUrl = uploadResult.image_url
        } catch (uploadError) {
          throw new Error('Failed to upload image: ' + uploadError.message)
        } finally {
          setUploadingImage(false)
        }
      }

      await api.createShoutOutMulti({
        message: message.trim(),
        recipient_ids: selected.map(s => s.id),
        is_public: visibility,
        image_url: imageUrl
      })

      setMessage('')
      setSelected([])
      setImageFile(null)
      setImagePreview('')
      setSuccess('Shout-out created successfully')
    } catch (e) {
      const msg = typeof e?.message === 'string' ? e.message : (e ? JSON.stringify(e) : 'Failed to create shout-out')
      setError(msg || 'Failed to create shout-out')
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
          <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{typeof error === 'string' ? error : JSON.stringify(error)}</div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Image (Optional)</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
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
            <button disabled={!canSubmit || submitting || uploadingImage} className="bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
              {uploadingImage ? 'Uploading Image...' : submitting ? 'Submitting...' : 'Create Shout-Out'}
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
