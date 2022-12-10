import EventEmitter from 'events';
import { PopupSuccess } from '../components/popups/PopupSuccess';

export const PopupEventType = {
  OPEN: 'popupEventType_open',
  CLOSE: 'popupEventType_close'
};

export default class PopupMediator extends EventEmitter {
  static _instance;

  constructor() {
    // constructor to enforce singleton
    super();
  }

  static get instance() {
    return this._instance || (this._instance = new this());
  }

  static open(component, popupProps) {
    PopupMediator.instance.emit(PopupEventType.OPEN, {
      component: component,
      popupProps: popupProps
    });
  }

  static close() {
    PopupMediator.instance.emit(PopupEventType.CLOSE);
  }
}
