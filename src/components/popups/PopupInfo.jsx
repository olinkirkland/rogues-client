import React from 'react';
import PopupMediator from '../../controllers/PopupController';

export function PopupInfo(props) {
  const { title, message } = props;

  return (
    <div className="popup popup--info">
      <div className="popup__header">
        <h2>{title}</h2>
        {/* <button className="btn-icon" onClick={PopupMediator.close}>
          <i className="fas fa-times" />
        </button> */}
      </div>
      <div className="popup__content">
        <p>{message}</p>
      </div>
    </div>
  );
}
