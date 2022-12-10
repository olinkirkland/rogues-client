import { createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import PopupMediator, { PopupEventType } from '../controllers/PopupController';

export default function PopupContainer() {
  useEffect(() => {
    const popupMediator = PopupMediator.instance;
    popupMediator.on(PopupEventType.OPEN, openPopup);
    popupMediator.on(PopupEventType.CLOSE, closePopup);

    return () => {
      popupMediator.off(PopupEventType.OPEN, openPopup);
      popupMediator.off(PopupEventType.CLOSE, closePopup);
    };
  }, []);

  return <div id="popupContainer" className="popup-container" />;
}

let popupContainerRoot;
function openPopup({ component, popupProps }) {
  if (!popupContainerRoot) {
    popupContainerRoot = createRoot(document.getElementById('popupContainer'));
  }

  const popupContainer = document.getElementById('popupContainer');
  // popupContainer.innerHTML = '';

  const popup = createElement(component, popupProps);
  popupContainerRoot.render(popup);

  if (popupProps.opaque)
    popupContainer.classList.add('popup-container--opaque');
  popupContainer.classList.add('popup-container--active');
}

function closePopup() {
  // Close the current popup
  const popupContainer = document.getElementById('popupContainer');
  popupContainer.innerHTML = '';
  popupContainer.classList.remove(
    'popup-container--active',
    'popup-container--opaque'
  );
}
