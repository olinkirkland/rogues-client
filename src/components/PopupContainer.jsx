import { createElement, useEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import PopupMediator, { PopupEventType } from '../controllers/PopupController';

export default function PopupContainer() {
  useEffect(() => {
    const popupMediator = PopupMediator.instance;
    popupMediator.on(PopupEventType.OPEN, openPopup);
    popupMediator.on(PopupEventType.CLOSE, closePopup);

    return () => {
      popupMediator.off(PopupEventType.OPEN);
      popupMediator.off(PopupEventType.CLOSE);
    };
  }, []);

  return <div id="popupContainer" className="popup-container" />;
}

function openPopup({ component, popupProps }) {
  // Unmount all children of popup-frame
  const popupContainer = document.getElementById('popupContainer');
  if (popupContainer) unmountComponentAtNode(popupContainer);

  // Get popup-frame element
  const popup = createElement(component, popupProps);
  render(popup, popupContainer);
  if (popupProps.opaque)
    popupContainer.classList.add('popup-container--opaque');
  popupContainer.classList.add('popup-container--active');
}

function closePopup() {
  // Close the current popup
  const popupContainer = document.getElementById('popupContainer');
  unmountComponentAtNode(popupContainer);
  popupContainer.classList.remove(
    'popup-container--active',
    'popup-container--opaque'
  );
}
