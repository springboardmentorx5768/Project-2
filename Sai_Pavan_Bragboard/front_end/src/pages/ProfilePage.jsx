import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getCurrentUserProfile, updateUserProfile } from '../api/apiService.js';
import './ProfilePage.css';

function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    department: '',
    bio: '',
    location: '',
    phone: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getCurrentUserProfile();
      setUser(profile);
      setEditForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        department: profile.department || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form when starting to edit
      setEditForm({
        full_name: user.full_name || '',
        email: user.email || '',
        department: user.department || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Attempting to update profile with data:', editForm);
      
      // Make API call to update the profile
      const updatedProfile = await updateUserProfile(editForm);
      
      console.log('Profile update successful:', updatedProfile);
      
      // Update local state with the response
      setUser(updatedProfile);
      setIsEditing(false);
      
      // Show success message (you can implement a toast notification)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      alert(`Failed to update profile: ${error.message || 'Please try again.'}`);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="content-header">
          <div className="header-content">
            <h1>Profile</h1>
            <p className="subtitle">Manage your account information</p>
          </div>
        </div>
        <div className="loading-state">
          <div className="shoutout-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-info">
                <div className="skeleton-line skeleton-name"></div>
                <div className="skeleton-line skeleton-time"></div>
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-text-1"></div>
              <div className="skeleton-line skeleton-text-2"></div>
              <div className="skeleton-line skeleton-text-3"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-content">
          <h1>My Profile</h1>
          <p className="subtitle">Manage your personal information and preferences</p>
        </div>
        <div className="header-actions">
          <button 
            className="auth-button"
            onClick={handleEditToggle}
          >
            {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      <div className="content-body">
        <div className="profile-container">
          {/* Profile Info Card */}
          <div className="card profile-card">
            <div className="card-header">
              <div className="profile-avatar-container">
                <div className="avatar profile-avatar">
                  {getInitials(user?.full_name)}
                </div>
                <div className="profile-status-badge">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sender-info">
                <h3 className="sender-name">{user?.full_name || 'No Name Set'}</h3>
                <p className="sender-department">{user?.department || 'No Department'}</p>
                <p className="timestamp">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="card-body">
              {isEditing ? (
                <div className="profile-edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="full_name">Full Name</label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={editForm.full_name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="department">Department</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={editForm.department}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Engineering, Marketing"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., +1 (555) 123-4567"
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="bio">About Me</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={editForm.bio}
                        onChange={handleInputChange}
                        className="form-input"
                        rows="3"
                        placeholder="Tell us a bit about yourself..."
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="auth-button save-btn" onClick={handleSaveProfile}>
                      💾 Save Changes
                    </button>
                    <button className="auth-button cancel-btn" onClick={handleEditToggle}>
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Email
                      </div>
                      <div className="info-value">{user?.email || 'Not provided'}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2h8z" clipRule="evenodd" />
                        </svg>
                        Department
                      </div>
                      <div className="info-value">{user?.department || 'Not provided'}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Location
                      </div>
                      <div className="info-value">{user?.location || 'Not provided'}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Phone
                      </div>
                      <div className="info-value">{user?.phone || 'Not provided'}</div>
                    </div>
                    
                    {user?.bio && (
                      <div className="info-item info-item-full">
                        <div className="info-label">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          About Me
                        </div>
                        <div className="info-value">{user.bio}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;