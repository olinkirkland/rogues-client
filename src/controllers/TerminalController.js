import EventEmitter from 'events';

export const TerminalEventType = {
  CHANGE: 'change'
};

export class Terminal extends EventEmitter {
  static _instance;
  static logs = [];

  constructor() {
    // Private constructor to enforce singleton
    super();
  }

  static get instance() {
    return this._instance || (this._instance = new this());
  }

  static log(message) {
    console.log(message);
    Terminal.logs.push(message);
    Terminal.instance.emit(TerminalEventType.CHANGE);
  }
}

export function log(message) {
  Terminal.log(message);
}
