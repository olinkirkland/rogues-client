import React from 'react';
import PopupMediator from '../../controllers/PopupController';

export function PopupDebug(props) {
  const { title, message } = props;

  return (
    <div className="popup popup--debug">
      <div className="popup__header">
        <h2>{title}</h2>
        <button className="btn-icon" onClick={PopupMediator.close}>
          <i className="fas fa-times" />
        </button>
      </div>
      <div className="popup__content">
        <button
          className="btn"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(message, null, 2))
          }
        >
          <i className="fas fa-copy"></i>
          <span>Copy</span>
        </button>
        <pre>{JSON.stringify(message, null, 8)}</pre>
      </div>
    </div>
  );
}
