import React from 'react';
import PopupMediator from '../../controllers/PopupController';

export function PopupSuccess(props) {
  const { title, message, onSuccess } = props;

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
        <button className="btn" onClick={onSuccess}>
          <i className="fas fa-check" />
        </button>
      </div>
    </div>
  );
}
