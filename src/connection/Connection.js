import EventEmitter from 'events';

export const DEV_MODE = location.hostname === 'localhost';

export const ConnectionEventType = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect'
};

export default class Connection extends EventEmitter {
  static _instance;

  static get instance() {
    if (!Connection._instance) Connection._instance = new Connection();
    return Connection._instance;
  }

  constructor() {
    if (Connection.instance) return Connection.instance;
    super();
  }

  getStoredLoginCredentials() {
    const storedLoginCredentials = localStorage.getItem('credentials');
    storedLoginCredentials ? JSON.parse(storedLoginCredentials) : null;
    return storedLoginCredentials;
  }

  useStoredLoginCredentialsToLogin() {
    const loginCredentials = this.getStoredLoginCredentials();
    this.login(loginCredentials.email, loginCredentials.password);
  }
}
