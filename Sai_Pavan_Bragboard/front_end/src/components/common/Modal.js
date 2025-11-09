import React from 'react';

const Modal = ({ open, onClose, title, children, footer }) => {
	if (!open) return null;
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				{title && (
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
						<h3 style={{ margin: 0 }}>{title}</h3>
						<button className="button button-outline" onClick={onClose} aria-label="Close modal">✕</button>
					</div>
				)}
				<div>
					{children}
				</div>
				{footer && (
					<div style={{ marginTop: '1rem' }}>
						{footer}
					</div>
				)}
			</div>
		</div>
	);
};

export default Modal;
