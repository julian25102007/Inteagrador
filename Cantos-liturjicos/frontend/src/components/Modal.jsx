import React from 'react';

export default function Modal({ title, children, onClose, actions, size }) {
  const sizeClass = size === 'compact' ? ' modal--compact' : '';
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={'modal' + sizeClass} onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        <div>{children}</div>
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
}
