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
    <main className="flex-1 p-6 overflow-y-auto">
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
  const [comments, setComments] = useState({})
  const [commentingTo, setCommentingTo] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState({})
  const [reportingTo, setReportingTo] = useState(null)
  const [reportReason, setReportReason] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchShoutouts()
  }, [selectedDepartment, filters])

  useEffect(() => {
    // Fetch reactions for all shoutouts when shoutouts change or user changes
    if (shoutouts.length > 0) {
      fetchAllReactions()
      fetchAllComments()
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

  const fetchAllComments = async () => {
    const commentsData = {}
    for (const shoutout of shoutouts) {
      try {
        const data = await api.getComments(shoutout.id)
        commentsData[shoutout.id] = data.comments
      } catch (e) {
        console.error(`Failed to fetch comments for shoutout ${shoutout.id}:`, e)
      }
    }
    setComments(commentsData)
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

  const handleAddComment = async (shoutoutId) => {
    if (!newComment.trim() || commentingTo === shoutoutId) return

    setCommentingTo(shoutoutId)
    try {
      await api.addComment(shoutoutId, newComment.trim())
      // Refresh comments for this shoutout
      const data = await api.getComments(shoutoutId)
      setComments(prev => ({
        ...prev,
        [shoutoutId]: data.comments
      }))
      setNewComment('')
      setShowComments(prev => ({ ...prev, [shoutoutId]: true }))
    } catch (e) {
      console.error('Failed to add comment:', e)
    } finally {
      setCommentingTo(null)
    }
  }

  const handleDeleteComment = async (commentId, shoutoutId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await api.deleteComment(commentId)
      // Refresh comments for this shoutout
      const data = await api.getComments(shoutoutId)
      setComments(prev => ({
        ...prev,
        [shoutoutId]: data.comments
      }))
    } catch (e) {
      console.error('Failed to delete comment:', e)
    }
  }

  const handleReportShoutOut = async () => {
    if (!reportReason.trim()) return

    setReportingTo(showReportModal)
    try {
      await api.reportShoutOut(showReportModal, reportReason.trim())
      setShowReportModal(null)
      setReportReason('')
      setSuccessMessage('Report submitted successfully. Thank you for helping keep our community safe.')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (e) {
      alert('Failed to submit report: ' + e.message)
    } finally {
      setReportingTo(null)
    }
  }

  const openReportModal = (shoutoutId) => {
    setShowReportModal(shoutoutId)
    setReportReason('')
  }

  const closeReportModal = () => {
    setShowReportModal(null)
    setReportReason('')
  }

  const toggleComments = (shoutoutId) => {
    setShowComments(prev => ({
      ...prev,
      [shoutoutId]: !prev[shoutoutId]
    }))
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
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center animate-fadeIn">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

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
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
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
                className="text-sm text-gray-600 hover:text-gray-800 underline transition-all duration-200 hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-fadeIn">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchShoutouts}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline transition-all duration-200 hover:scale-105"
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
          {shoutouts.map((shoutout, index) => (
            <div key={shoutout.id} className="bg-gradient-to-br from-slate-800/60 to-purple-900/40 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {shoutout.giver_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{shoutout.giver_name}</h3>
                    <p className="text-sm text-gray-300">{shoutout.giver_department}</p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <p className="text-sm text-gray-300">{formatDate(shoutout.created_at)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    shoutout.category === 'teamwork' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    shoutout.category === 'innovation' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    shoutout.category === 'leadership' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    shoutout.category === 'customer_service' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    shoutout.category === 'problem_solving' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {shoutout.category.replace('_', ' ')}
                  </span>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteShoutOut(shoutout.id)}
                      disabled={deletingId === shoutout.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 transition-all duration-200 hover:scale-110 hover:bg-red-50 rounded"
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
                  <button
                    onClick={() => openReportModal(shoutout.id)}
                    className="text-gray-500 hover:text-red-500 p-1 transition-all duration-200 hover:scale-110 hover:bg-red-50 rounded"
                    title="Report shout-out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-gray-100 mb-4 whitespace-pre-wrap">{shoutout.message}</p>

              {shoutout.image_url && (
                <div className="mb-4">
                  <img
                    src={`http://127.0.0.1:8000${shoutout.image_url}`}
                    alt="Shout-out attachment"
                    className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-200 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
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
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                          userReacted
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        } ${reactingTo === shoutout.id ? 'opacity-50 animate-pulse' : ''}`}
                        title={label}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="font-medium">{count}</span>}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => toggleComments(shoutout.id)}
                  className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-sm transition-all duration-200 hover:scale-105 hover:bg-gray-100"
                >
                  💬 {comments[shoutout.id]?.length || 0} Comment{comments[shoutout.id]?.length !== 1 ? 's' : ''}
                </button>
              </div>

              {/* Comments Section */}
              {showComments[shoutout.id] && (
                <div className="mb-4 p-4 bg-gradient-to-br from-slate-700/40 to-purple-800/30 backdrop-blur-sm rounded-lg border border-white/10">
                  {/* Add Comment Form */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(shoutout.id)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                        disabled={commentingTo === shoutout.id}
                      />
                      <button
                        onClick={() => handleAddComment(shoutout.id)}
                        disabled={!newComment.trim() || commentingTo === shoutout.id}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-md"
                      >
                        {commentingTo === shoutout.id ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {comments[shoutout.id]?.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">{comment.user_name}</span>
                            <span className="text-xs text-gray-300">{formatDate(comment.created_at)}</span>
                            {comment.can_delete && (
                              <button
                                onClick={() => handleDeleteComment(comment.id, shoutout.id)}
                                className="text-red-400 hover:text-red-300 text-xs p-1 transition-all duration-200 hover:scale-110 hover:bg-red-500/20 rounded"
                                title="Delete comment"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          <p className="text-gray-200 text-sm">{comment.comment_text}</p>
                        </div>
                      </div>
                    ))}
                    {(!comments[shoutout.id] || comments[shoutout.id].length === 0) && (
                      <div className="text-center text-gray-400 text-sm py-4">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center space-x-4">
                  <span>To: {shoutout.receiver_name} ({shoutout.receiver_department})</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    shoutout.is_public === 'public' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    shoutout.is_public === 'department_only' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
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
          <button onClick={() => setActiveView('create')} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 animate-bounce">
            Create Your First Shout-Out
          </button>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Report Shout-Out</h3>
              <button
                onClick={closeReportModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Please select a reason for reporting this shout-out. Reports are anonymous and help maintain a positive community.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { value: 'inappropriate_content', label: 'Inappropriate Content' },
                { value: 'spam', label: 'Spam' },
                { value: 'harassment', label: 'Harassment' },
                { value: 'offensive_language', label: 'Offensive Language' },
                { value: 'other', label: 'Other' }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={value}
                    checked={reportReason === value}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeReportModal}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReportShoutOut}
                disabled={!reportReason || reportingTo === showReportModal}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {reportingTo === showReportModal ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
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
          <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 animate-fadeIn">{typeof error === 'string' ? error : JSON.stringify(error)}</div>
        ) : null}
        {success ? (
          <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 animate-fadeIn">{success}</div>
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-200 hover:scale-110 hover:shadow-lg"
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
                  <button key={u.id} type="button" onClick={()=>addRecipient(u)} className="w-full text-left px-2 py-2 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm hover:bg-indigo-50">
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
                  <span key={u.id} className="inline-flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 hover:bg-indigo-200">
                    {u.name}
                    <button type="button" onClick={()=>removeRecipient(u.id)} className="ml-2 text-indigo-600 hover:text-indigo-800 transition-all duration-200 hover:scale-110 hover:bg-indigo-300 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                  </span>
                ))}
                {!selected.length && <div className="text-gray-500 text-sm">No recipients selected</div>}
              </div>
            </div>
          </div>

          <div>
          <button disabled={!canSubmit || submitting || uploadingImage} className="bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:animate-none">
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
  const [activeTab, setActiveTab] = useState('contributors')
  const [topContributors, setTopContributors] = useState([])
  const [mostTagged, setMostTagged] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics()
      if (activeTab === 'reports') {
        fetchReports()
      }
    }
  }, [user, activeTab])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const [contributorsData, taggedData] = await Promise.all([
        api.getTopContributors(),
        api.getMostTagged()
      ])

      setTopContributors(contributorsData.top_contributors || [])
      setMostTagged(taggedData.most_tagged || [])
    } catch (e) {
      setError(e.message || 'Failed to load analytics data')
      setTopContributors([])
      setMostTagged([])
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.getReports('all')
      setReports(data.reports || [])
    } catch (e) {
      setError(e.message || 'Failed to load reports')
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const handleResolveReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to mark this report as resolved?')) return

    try {
      await api.resolveReport(reportId)
      // Refresh reports
      fetchReports()
      alert('Report resolved successfully!')
    } catch (e) {
      alert('Failed to resolve report: ' + e.message)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Analytics Dashboard
          </h2>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
            <p className="text-red-700">
              This dashboard is only available to administrators.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-700/40 to-purple-800/30 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
              Admin Analytics Dashboard
            </h2>
            <p className="text-gray-300 text-sm">Real-time insights into shout-out activity and engagement</p>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/25"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Data</span>
              </div>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-center backdrop-blur-sm">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline transition-all duration-200 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-gradient-to-br from-slate-700/40 to-purple-800/30 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/10 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading analytics data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('contributors')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'contributors'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contributors & Tagged
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reports ({reports.filter(r => r.status === 'pending').length})
              </button>
            </div>

            {activeTab === 'contributors' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Contributors */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Top Contributors</h3>
                      <p className="text-emerald-200 text-sm">Most active shout-out givers</p>
                    </div>
                  </div>

                  {topContributors.length > 0 ? (
                    <div className="space-y-3">
                      {topContributors.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-lg">{contributor.name}</p>
                              <p className="text-sm text-emerald-200 capitalize">{contributor.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-300">{contributor.shoutouts_given}</p>
                            <p className="text-xs text-emerald-200">shout-outs given</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-emerald-200 text-lg">No contributors data available</p>
                      <p className="text-emerald-300 text-sm mt-2">Start giving shout-outs to see activity!</p>
                    </div>
                  )}
                </div>

                {/* Most Tagged */}
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Most Tagged</h3>
                      <p className="text-blue-200 text-sm">Most recognized team members</p>
                    </div>
                  </div>

                  {mostTagged.length > 0 ? (
                    <div className="space-y-3">
                      {mostTagged.map((tagged, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-lg">{tagged.name}</p>
                              <p className="text-sm text-blue-200 capitalize">{tagged.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-300">{tagged.shoutouts_received}</p>
                            <p className="text-xs text-blue-200">shout-outs received</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <p className="text-blue-200 text-lg">No tagged users data available</p>
                      <p className="text-blue-300 text-sm mt-2">Give shout-outs to see recognition!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Reports Tab */
              <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-red-400/20 hover:border-red-400/40 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Reported Shout-Outs</h3>
                    <p className="text-red-200 text-sm">Manage community reports</p>
                  </div>
                </div>

                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                        report.status === 'pending'
                          ? 'bg-yellow-500/10 border-yellow-400/30 hover:bg-yellow-500/20'
                          : 'bg-green-500/10 border-green-400/30 hover:bg-green-500/20'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                report.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
                              }`}>
                                {report.status}
                              </span>
                              <span className="text-sm text-gray-300">
                                Reported by {report.reporter_name} • {formatDate(report.created_at)}
                              </span>
                            </div>
                            <p className="text-white font-medium mb-1">Reason: {report.reason.replace('_', ' ')}</p>
                            <p className="text-gray-200 text-sm mb-2">
                              <strong>Shout-out by {report.shoutout_giver_name}:</strong> {report.shoutout_message}
                            </p>
                          </div>
                          {report.status === 'pending' && (
                            <button
                              onClick={() => handleResolveReport(report.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200 hover:scale-105 shadow-md"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-200 text-lg">No reports available</p>
                    <p className="text-red-300 text-sm mt-2">All shout-outs are behaving well!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainContent
