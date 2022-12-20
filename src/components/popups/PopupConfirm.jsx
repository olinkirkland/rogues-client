import React from 'react';
import PopupMediator from '../../controllers/PopupController';

export function PopupConfirm(props) {
  const { title, message, onConfirm, onCancel, confirmText, cancelText } =
    props;

  return (
    <div className="popup popup--success">
      <div className="popup__header">
        <h2>{title}</h2>
        <button className="btn-icon" onClick={PopupMediator.close}>
          <i className="fas fa-times" />
        </button>
      </div>
      <div className="popup__content">
        <p>{message}</p>
      </div>
      <div className="popup__footer">
        <button className="btn" onClick={onCancel || PopupMediator.close}>
          <i className="fas fa-times" />
          <span>{props.cancelText || 'Cancel'}</span>
        </button>
        <button className="btn" onClick={onConfirm}>
          <i className="fas fa-check" />
          <span>{props.confirmText || 'Confirm'}</span>
        </button>
      </div>
    </div>
  );
}
