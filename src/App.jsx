import { useEffect } from 'react';
import Platform from './components/Platform';
import PopupContainer from './components/PopupContainer';
import { PopupSuccess } from './components/popups/PopupSuccess';
import Connection from './controllers/Connection';
import PopupController from './controllers/PopupController';

import './css/styles.css';

import './css/modal.css';
import './css/platform.css';
import './css/popups.css';
import { PopupInfo } from './components/popups/PopupInfo';

function App() {
  useEffect(() => {
    // Show a popup
    PopupController.open(PopupInfo, {
      title: 'Connecting...',
      message: 'Please wait while we connect to the server.',
      opaque: true
    });

    // Establish a connection
    const connection = Connection.instance;
    connection.initialize();
  }, []);

  return (
    <div>
      <PopupContainer />
      <Platform />
    </div>
  );
}

export default App;
