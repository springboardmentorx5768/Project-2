import React, { useState } from 'react';

function CreateShoutoutModal({ onClose, onSubmit }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ message, recipient_ids: [1] }); 
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Give a Shout-Out</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="create-post-input"
            rows="5"
            placeholder="Write your appreciation message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="auth-button btn-secondary">Cancel</button>
            <button type="submit" className="auth-button btn-primary">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateShoutoutModal;