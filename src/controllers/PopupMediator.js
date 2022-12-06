import EventEmitter from 'events';

const PopupMediatorEventType = {
  OPEN: 'open',
  CLOSE: 'close'
};

export default class PopupMediator extends EventEmitter {
  static _instance;

  constructor() {
    // Private constructor to enforce singleton
    super();
  }

  static get instance() {
    return this._instance || (this._instance = new this());
  }

  static open(componentClass, popupProps) {
    PopupMediator.instance.emit(PopupMediatorEventType.OPEN, {
      componentClass: componentClass,
      popupProps: popupProps
    });
  }

  static close() {
    PopupMediator.instance.emit(PopupMediatorEventType.CLOSE);
  }
}
