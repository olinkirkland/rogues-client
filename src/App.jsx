import Platform from './components/Platform';
import PopupContainer from './components/PopupContainer';
import PopupController from './controllers/PopupController';

import './css/styles.css';

import './css/modal.css';
import './css/platform.css';
import './css/popups.css';
import { useEffect } from 'react';
import { PopupSuccess } from './components/popups/PopupSuccess';

function App() {
  useEffect(() => {
    openRepeatingSuccessPopup();
  }, []);

  return (
    <div>
      <PopupContainer />
      <Platform />
    </div>
  );
}

function openRepeatingSuccessPopup() {
  PopupController.open(PopupSuccess, {
    title: 'Success',
    message: 'This is a repeating success message',
    onSuccess: () => {
      PopupController.close();
      setTimeout(openRepeatingSuccessPopup, 1000);
    },
    opaque: true
  });
}

export default App;
