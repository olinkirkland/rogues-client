import React from 'react';
import Connection, { me } from '../controllers/Connection';
import PopupController from '../controllers/PopupController';
import { PopupDebug } from './popups/PopupDebug';
import { PopupConfirm } from './popups/PopupConfirm';

function Platform() {
  return (
    <div id="platform">
      <header>
        <span className="logo">Rogues & Heroes</span>
        <button className="btn-icon">
          <i className="fas fa-bell" />
        </button>
      </header>

      <nav>
        <ul>
          <li>
            <button className="btn">
              <i className="fas fa-home" />
              <span>Home</span>
            </button>
          </li>
          <li>
            <button
              className="btn"
              onClick={() => {
                PopupController.open(PopupDebug, {
                  title: 'Profile data',
                  message: me
                });
              }}
            >
              <i className="fas fa-user" />
              <span>Profile</span>
            </button>
          </li>
          <li>
            <button className="btn" disabled>
              <i className="fas fa-server" />
              <span>Servers</span>
            </button>
          </li>
          <li>
            <button className="btn" disabled>
              <i className="fas fa-store" />
              <span>Store</span>
            </button>
          </li>
          <li>
            <button className="btn" disabled>
              <i className="fas fa-users" />
              <span>Community</span>
            </button>
          </li>
          <li className="li-after-gap">
            <button className="btn" disabled>
              <i className="fas fa-cog" />
              <span>Settings</span>
            </button>
          </li>
          <li>
            <button
              className="btn"
              onClick={() =>
                PopupController.open(PopupConfirm, {
                  title: 'Logout',
                  message: 'Are you sure you want to logout?',
                  onConfirm: () => {
                    Connection.instance.logout();
                  },
                  confirmText: 'Logout',
                  cancelText: 'Cancel'
                })
              }
            >
              <i className="fas fa-sign-out-alt" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      <footer></footer>
    </div>
  );
}

export default Platform;
