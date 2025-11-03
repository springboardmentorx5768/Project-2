import React, { useState, useEffect, useRef } from 'react';
import { getUsers, uploadFile } from '../../api/apiService';

// If `inline` is true, render as a block form (suitable for a full page or
// main-area slot). Otherwise render as centered modal overlay.
function CreateShoutoutModal({ onClose, onSubmit, inline = false }) {
  const [message, setMessage] = useState('');
  const [isAll, setIsAll] = useState(false);
  const [department, setDepartment] = useState('');
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  
  // Mention/tagging states
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const maxCharacters = 500;

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle message input and detect @ mentions
  const handleMessageChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setMessage(value);
    setCursorPosition(cursorPos);
    
    // Check if user is typing a mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      
      // Filter users based on query
      const filtered = users.filter(user => 
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      ).slice(0, 5); // Limit to 5 suggestions
      
      setFilteredUsers(filtered);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
      setFilteredUsers([]);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (user) => {
    const textBeforeCursor = message.substring(0, cursorPosition);
    const textAfterCursor = message.substring(cursorPosition);
    
    // Find the @ symbol position
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const beforeMention = textBeforeCursor.substring(0, mentionStart);
    
    // Replace the @query with @username
    const newMessage = beforeMention + `@${user.full_name} ` + textAfterCursor;
    setMessage(newMessage);
    
    // Close dropdown
    setShowMentionDropdown(false);
    setMentionQuery('');
    setFilteredUsers([]);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + `@${user.full_name} `.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (e) => {
    if (showMentionDropdown && filteredUsers.length > 0) {
      if (e.key === 'Escape') {
        setShowMentionDropdown(false);
        e.preventDefault();
      }
      // You can add arrow key navigation here if needed
    }
  };

  // File upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('File type not supported. Please upload images (JPG, PNG, GIF) or PDF files.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadError('');

    try {
      const uploadResult = await uploadFile(file);
      setUploadedFile(uploadResult);
      setSelectedFile(file);
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadError(error.message || 'Failed to upload file. Please try again.');
      setSelectedFile(null);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const payload = { message: message.trim() };
      
      if (isAll) {
        payload.is_all = true;
      } else if (department) {
        payload.target_department = department;
      } else {
        // Default: send to everyone when using mentions
        payload.is_all = true;
      }

      // Add attachment data if file was uploaded
      if (uploadedFile) {
        payload.attachment_url = uploadedFile.file_url;
        payload.attachment_filename = uploadedFile.filename;
        payload.attachment_type = uploadedFile.file_type;
        payload.attachment_size = uploadedFile.file_size;
      }
      
      await onSubmit(payload);
      setMessage('');
      setIsAll(false);
      setDepartment('');
      setShowMentionDropdown(false);
      removeFile(); // Clear uploaded file
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCountClass = () => {
    const length = message.length;
    if (length > maxCharacters) return 'character-count error';
    if (length > maxCharacters * 0.8) return 'character-count warning';
    return 'character-count';
  };

  const content = (
    <div className={`modal-content ${inline ? 'inline-form' : ''}`}>
      <h2 className="modal-title">Create Post</h2>
      <form onSubmit={handleSubmit} className="create-shoutout-form">
        
        {/* Recipients Section */}
        <div className="form-section">
          <div className="form-section-title">Send to</div>
          <div className="recipients-section">
            
            {/* Send to Everyone Option */}
            <div className="recipients-controls">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="send-to-all"
                  checked={isAll} 
                  onChange={(e) => {
                    setIsAll(e.target.checked);
                    if (e.target.checked) {
                      setDepartment('');
                    }
                  }} 
                />
                <label htmlFor="send-to-all" className="checkbox-label">
                  Everyone
                </label>
              </div>
            </div>

            {/* Department Selection */}
            {!isAll && (
              <div className="recipients-controls">
                <div className="department-select-wrapper">
                  <select 
                    value={department} 
                    onChange={(e) => {
                      setDepartment(e.target.value);
                    }} 
                    className="department-select"
                  >
                    <option value="">Select department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">HR</option>
                    <option value="Design">Design</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Message Section */}
        <div className="form-section">
          <div className="form-section-title">Message</div>
          <div className="message-section">
            <div className="textarea-container">
              <textarea
                ref={textareaRef}
                className="message-textarea"
                placeholder="Write your message... Use @name to mention someone!"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                maxLength={maxCharacters + 50}
                required
              />
              
              {/* Mention Dropdown */}
              {showMentionDropdown && filteredUsers.length > 0 && (
                <div className="mention-dropdown">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className="mention-item"
                      onClick={() => handleMentionSelect(user)}
                    >
                      <div className="mention-avatar">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="mention-info">
                        <div className="mention-name">{user.full_name}</div>
                        <div className="mention-department">{user.department}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="character-counter">
              <div className="mention-hint">
                💡 Type @ to mention someone in your message
              </div>
              <span className={getCharacterCountClass()}>
                {message.length}/{maxCharacters}
              </span>
            </div>
          </div>
        </div>

        {/* File Attachment Section */}
        <div className="form-section">
          <div className="form-section-title">Attachments (Optional)</div>
          <div className="attachment-section">
            
            {/* File Upload Area */}
            {!selectedFile && (
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="file-input-hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-button">
                  <div className="upload-icon">📎</div>
                  <div className="upload-text">
                    <div className="upload-title">Choose file to attach</div>
                    <div className="upload-subtitle">Images (JPG, PNG, GIF) or PDF • Max 10MB</div>
                  </div>
                </label>
              </div>
            )}

            {/* Upload Progress/Error */}
            {isUploading && (
              <div className="upload-progress">
                <div className="upload-spinner"></div>
                <span>Uploading file...</span>
              </div>
            )}

            {uploadError && (
              <div className="upload-error">
                <span className="error-icon">❌</span>
                <span>{uploadError}</span>
              </div>
            )}

            {/* File Preview */}
            {selectedFile && uploadedFile && (
              <div className="file-preview">
                <div className="file-info">
                  <div className="file-icon">
                    {uploadedFile.file_type === 'image' ? '🖼️' : 
                     uploadedFile.file_type === 'pdf' ? '📄' : '📎'}
                  </div>
                  <div className="file-details">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file-button"
                    onClick={removeFile}
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Image Preview */}
                {uploadedFile.file_type === 'image' && (
                  <div className="image-preview">
                    <img 
                      src={`http://127.0.0.1:8080${uploadedFile.file_url}`} 
                      alt="Preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onClose && (
            <button 
              type="button" 
              onClick={onClose} 
              className="create-cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="create-submit-button"
            disabled={isSubmitting || !message.trim() || message.length > maxCharacters}
          >
            {isSubmitting ? (
              <>Posting...</>
            ) : (
              <>Post</>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return <div className="create-page-card card">{content}</div>;
  }

  return (
    <div className="modal-overlay">
      {content}
    </div>
  );
}

export default CreateShoutoutModal;