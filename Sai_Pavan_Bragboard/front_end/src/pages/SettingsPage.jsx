import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getUserSettings, updateUserSettings, deleteUserAccount } from '../api/apiService.js';
import './SettingsPage.css';

function SettingsPage() {
  const { user: authUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    public_profile: true,
    show_email: false,
    show_phone: false,
    theme: 'light',
    language: 'en'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true);
      const userSettings = await getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      // Use default settings if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    const previousSettings = { ...settings };
    
    // Optimistically update the UI
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    try {
      setIsSaving(true);
      // Save the single setting change to the backend
      const updateData = { [setting]: value };
      await updateUserSettings(updateData);
      console.log(`Setting ${setting} saved successfully:`, value);
    } catch (error) {
      console.error(`Failed to save setting ${setting}:`, error);
      // Revert the change if saving failed
      setSettings(previousSettings);
      alert(`Failed to save setting: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteUserAccount();
        alert('Your account has been deactivated successfully.');
        logout(); // Log the user out after account deletion
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert(`Failed to delete account: ${error.message}`);
      }
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
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

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="content-header">
          <div className="header-content">
            <h1>Settings</h1>
            <p className="subtitle">Manage your account preferences and privacy</p>
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
          <h1>Settings</h1>
          <p className="subtitle">Manage your account preferences and privacy settings</p>
        </div>
      </div>

      <div className="content-body">
        <div className="settings-container">
          {/* Notifications Settings */}
          <div className="card settings-card">
            <div className="card-header">
              <div className="settings-icon-container">
                <div className="settings-icon notifications">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              <div className="sender-info">
                <h3 className="sender-name">Notifications</h3>
                <p className="sender-department">Control how you receive updates</p>
              </div>
            </div>

            <div className="card-body">
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Email Notifications</div>
                    <div className="setting-description">Receive notifications via email</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Push Notifications</div>
                    <div className="setting-description">Receive browser push notifications</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.push_notifications}
                      onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Weekly Digest</div>
                    <div className="setting-description">Get a weekly summary of activity</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.weekly_digest}
                      onChange={(e) => handleSettingChange('weekly_digest', e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card settings-card">
            <div className="card-header">
              <div className="settings-icon-container">
                <div className="settings-icon privacy">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sender-info">
                <h3 className="sender-name">Privacy</h3>
                <p className="sender-department">Control your profile visibility</p>
              </div>
            </div>

            <div className="card-body">
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Public Profile</div>
                    <div className="setting-description">Make your profile visible to others</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.public_profile}
                      onChange={(e) => handleSettingChange('public_profile', e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Show Email</div>
                    <div className="setting-description">Display email address on profile</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.show_email}
                      onChange={(e) => handleSettingChange('show_email', e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-label">Show Phone</div>
                    <div className="setting-description">Display phone number on profile</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.show_phone}
                      onChange={(e) => handleSettingChange('show_phone', e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences section removed as requested */}

          {/* Account Management */}
          <div className="card settings-card danger-card">
            <div className="card-header">
              <div className="settings-icon-container">
                <div className="settings-icon danger">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="sender-info">
                <h3 className="sender-name">Account Management</h3>
                <p className="sender-department">Manage your account and data</p>
              </div>
            </div>

            <div className="card-body">
              <div className="danger-section">
                <div className="danger-warning">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4>Delete Account</h4>
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                </div>
                <button 
                  className="danger-button"
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                >
                  {showDeleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
                </button>
                {showDeleteConfirm && (
                  <button 
                    className="cancel-button"
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{ marginLeft: '12px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global loading overlay when saving settings */}
      {isSaving && (
        <div className="settings-loading-overlay">
          <div className="settings-loading-content">
            <div className="loading-spinner"></div>
            <p>Saving settings...</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default SettingsPage;