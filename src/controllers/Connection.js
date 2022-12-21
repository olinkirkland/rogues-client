import axios from 'axios';
import EventEmitter from 'events';
import { connect } from 'socket.io-client';
import { PopupDebug } from '../components/popups/PopupDebug';
import { PopupInfo } from '../components/popups/PopupInfo';
import { PopupSuccess } from '../components/popups/PopupSuccess';
import PopupController from './PopupController';

export const DEV_MODE = location.hostname === 'localhost';

export const AUTH_SERVER = 'http://localhost:3001/';
export const MAIN_SERVER = 'http://localhost:3002/';
export const SOCKET_SERVER = 'http://localhost:3003/';

export let me = {};

export const ConnectionEventType = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ACCESS_TOKEN_CHANGED: 'access_token_changed',
  USER_DATA_CHANGED: 'user_data_changed'
};

export default class Connection extends EventEmitter {
  static _instance;

  constructor() {
    // constructor to enforce singleton
    super();
  }

  static get instance() {
    return this._instance || (this._instance = new this());
  }

  async initialize() {
    axios.defaults.withCredentials = true;
    this.addInterceptors();

    // Check if there is a refresh token in local storage
    // Either login as guest or load the refresh token
    const storedRefreshToken = localStorage.getItem('refresh-token');
    if (storedRefreshToken) {
      console.log('🔑', 'Refresh token found in local storage');
      this.refreshToken = storedRefreshToken;
      me.id = await this.fetchAccessToken();
      this.connect();
    } else {
      console.log('🔑', 'No refresh token found in local storage');
      this.login(null, null);
    }

    // Set an interval to refresh the access token every 5 minutes
    setInterval(() => this.fetchAccessToken(), 1000 * 60 * 5);
  }

  async fetchAccessToken() {
    console.log('🔑', 'Fetching new access token...');
    try {
      const res = await axios.post(AUTH_SERVER + 'token', {
        refreshToken: this.refreshToken
      });
      console.log('✔️ Access token fetched');
      this.accessToken = res.data.accessToken;
      this.emit(ConnectionEventType.ACCESS_TOKEN_CHANGED);
      return res.data.id; // Returns user id
    } catch (err) {
      console.log('❌', `${err}`);
      localStorage.removeItem('refresh-token');
      this.logout();
    }
  }

  async login(email, password) {
    PopupController.open(PopupInfo, {
      title: 'Logging in',
      message: 'Please wait...'
    });

    console.log(
      '🔑',
      'Logging in',
      email && password ? `${email} / ${password}` : 'anonymously',
      '...'
    );

    const res = await axios.post(
      AUTH_SERVER + 'login',
      email && password ? { email: email, password: password } : null
    );

    try {
      if (!res.data.id) {
        PopupController.open(PopupInfo, {
          title: 'Login failed',
          message: 'Could not login with the provided credentials.'
        });
        localStorage.removeItem('refresh-token');
        return;
      }

      me.id = res.data.id;
      console.log('✔️ Logged in as', me.id);

      this.refreshToken = res.data.refreshToken;
      this.accessToken = res.data.accessToken;
      this.emit(ConnectionEventType.ACCESS_TOKEN_CHANGED);

      // Save the refresh token to local storage
      localStorage.setItem('refresh-token', this.refreshToken);
    } catch (err) {
      localStorage.removeItem('refresh-token');
      PopupController.open(PopupDebug, {
        title: 'Login failed',
        message: res
      });
    }

    this.connect();
  }

  async logout() {
    console.log('🔑', 'Logging out...');
    localStorage.removeItem('refresh-token');
    this.refreshToken = null;
    this.accessToken = null;
    this.emit(ConnectionEventType.ACCESS_TOKEN_CHANGED);
    this.socket?.disconnect();
    this.emit(ConnectionEventType.DISCONNECT);
    PopupController.open(PopupInfo, {
      title: 'Logged out',
      message: 'You have been logged out.',
      opaque: true
    });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  connect() {
    PopupController.open(PopupInfo, {
      title: 'Connecting...',
      message: 'Establishing a real-time connection.'
    });

    if (this.socket) this.socket.disconnect(); // Disconnect if already connected

    console.log('🔌', 'Connecting to socket server...');
    this.socket = connect(SOCKET_SERVER, {
      query: {
        token: this.refreshToken
      }
    });

    // Add socket listeners
    this.socket.on('connect', async () => {
      console.log(`✔️ Connected to ${SOCKET_SERVER} as ${me.id}`);
      await this.validateMyUserData();
      PopupController.close();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      PopupController.open(PopupInfo, {
        title: 'Disconnected',
        message: 'You have been disconnected from the server.'
      });
    });

    // this.socket?.on('chat', (data) => {
    //   this.chats.push(data);
    //   this.emit(ConnectionEventType.CHAT_MESSAGE, data);
    // });

    // On invalidate
    this.socket.on('invalidate-user-data', () => {
      console.log('--invalidate-user-data');
      // this.fetchMyUserData();
    });
  }

  async validateMyUserData() {
    console.log('👤', 'Fetching user data...');
    try {
      const res = await axios.get(MAIN_SERVER + 'me');
      console.log('✔️ User data fetched');
      Object.assign(me, res.data);
      this.emit(ConnectionEventType.USER_DATA_CHANGED);
    } catch (err) {
      console.log('❌', `${err}`);
    }
  }

  addInterceptors() {
    axios.interceptors.request.use((config) => {
      if (!this.accessToken) return config;
      if (!config) config = {};
      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });
    axios.interceptors.response.use(
      (res) => {
        return res;
      },
      async (error) => {
        if (error.response) {
          if (error.response.status === 403) {
            console.log('🔑', 'Access token rejected');
            await this.fetchAccessToken();
            const config = error.config;
            config.headers['Authorization'] = `Bearer ${this.accessToken}`;
            return axios(config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  useStoredLoginCredentialsToLogin() {
    const loginCredentials = this.getStoredLoginCredentials();
    this.login(loginCredentials.email, loginCredentials.password);
  }

  getStoredLoginCredentials() {
    const storedLoginCredentials = localStorage.getItem('credentials');
    storedLoginCredentials ? JSON.parse(storedLoginCredentials) : null;
    return storedLoginCredentials;
  }
}
