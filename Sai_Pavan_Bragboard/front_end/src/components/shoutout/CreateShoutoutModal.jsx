import React, { useState } from 'react';

// If `inline` is true, render as a block form (suitable for a full page or
// main-area slot). Otherwise render as centered modal overlay.
function CreateShoutoutModal({ onClose, onSubmit, inline = false }) {
  const [message, setMessage] = useState('');

  const [isAll, setIsAll] = React.useState(false);
  const [department, setDepartment] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { message };
    if (isAll) payload.is_all = true;
    else if (department) payload.department = department;
    else payload.recipient_ids = [1];
    onSubmit(payload);
    setMessage('');
  };

  const content = (
    <div className={`modal-content ${inline ? 'inline-form' : ''}`}>
      <h2 className="modal-title">Give a Shout-Out</h2>
        <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={isAll} onChange={(e) => setIsAll(e.target.checked)} />
            Send to all users
          </label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} disabled={isAll} style={{ flex: 1 }}>
            <option value="">Select department (optional)</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
        <textarea
          className="create-post-input"
          rows="6"
          placeholder="Write your appreciation message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          {onClose && (
            <button type="button" onClick={onClose} className="button button-outline">Cancel</button>
          )}
          <button type="submit" className="button">Post</button>
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