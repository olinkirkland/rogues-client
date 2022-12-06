import axios from 'axios';
import EventEmitter from 'events';
import { io, Socket } from 'socket.io-client';
import { PopupBook } from '../components/popups/PopupBook';
import { PopupError } from '../components/popups/PopupError';
import { PopupLevelUp } from '../components/popups/PopupLevel';
import { PopupLoading } from '../components/popups/PopupLoading';
import { cookie } from '../components/popups/PopupPresets';
import { PopupSuccess } from '../components/popups/PopupSuccess';
import PopupMediator from '../controllers/PopupMediator';
import Terminal, { TerminalEventType } from '../controllers/Terminal';
import Chat from '../models/Chat';
import Item, { getItemById } from '../models/Item';
import { systemUser } from '../models/User';
import Game, { GameCategory, GameOptions } from './Game';
import { doAfterLogin } from './Test';

export const VERSION: string = '1.0.0';

// eslint-disable-next-line no-restricted-globals
export const DEV_MODE: boolean = location.hostname === 'localhost';
// export const DEV_MODE: boolean = false;
// export const url: string = DEV_MODE
//   ? 'http://localhost:8000/'
//   : 'https://dontfall-backend.herokuapp.com/';

// export const url: string = 'https://dontfall-backend.herokuapp.com/';
export const url: string =
  'https://knobel-js-backend-production.up.railway.app/';
console.log('Development mode?', DEV_MODE);
console.log('Base-url:', url);

export let mouseCoords = {
  x: 0,
  y: 0
};

document.addEventListener('mousemove', (e) => {
  mouseCoords = {
    x: e.clientX,
    y: e.clientY
  };
});

export enum ConnectionEventType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  USER_DATA_CHANGED = 'user-data-changed',
  CHAT_MESSAGE = 'chat-message',
  ONLINE_USERS = 'online-users'
}

export default class Connection extends EventEmitter {
  private static _instance: Connection;

  private socket: Socket | undefined;

  // Data
  public me?: MyUserData;
  public onlineUsers: number = 0;
  public chatMessages: Chat[] = [];
  public game: Game | undefined;

  // Callbacks
  setIsConnected!: Function;

  private constructor() {
    // Private constructor to enforce singleton
    super();

    // Get stored login credentials
    let loginCredentials = { email: null, password: null };
    const storedLoginCredentials = localStorage.getItem('login');
    if (storedLoginCredentials) {
      loginCredentials = JSON.parse(storedLoginCredentials);
      Terminal.log('🔑', 'Login credentials loaded from local storage');
    } else {
      Terminal.log('🔑', 'No login credentials found in local storage');
    }

    // Use the login credentials to login
    this.login(loginCredentials.email, loginCredentials.password);

    this.addTerminalListeners();
  }

  private error(title: string, message: string) {
    Terminal.log('❌', title);
    PopupMediator.open(PopupError, {
      title: title,
      message: message
    });
  }

  public getMe() {
    Terminal.log('🔑', 'Getting my user data', '...');
    Terminal.log(`${url}users/${this.me?.id}`);
    axios
      .get(`${url}users/${this.me?.id}`, { withCredentials: true })
      .then((res) => {
        this.me = res.data;
        if (!this.me!.inventory) this.me!.inventory = [];
        this.emit(ConnectionEventType.USER_DATA_CHANGED, res.data);
        Terminal.log('🔑', 'Me', res.data);
      })
      .catch((err) => {
        Terminal.log('⚠️', err);
      });
  }

  public login(
    email: string | null,
    password: string | null,
    staySignedIn: boolean = false
  ) {
    PopupMediator.open(PopupLoading);

    if ((email || password) && !(email && password))
      return Terminal.log(
        '⚠️',
        'Both an email and a password are required to login'
      );

    Terminal.log(
      '🔑',
      'Logging in',
      email && password ? `${email} / ${password}` : 'anonymously',
      '...'
    );

    // Add a welcome message to chat
    this.chatMessages.push({
      user: systemUser,
      message:
        '👋 Welcome to the Knobel Ninja public chat room! Any messages you send here will be broadcasted to all users.',
      time: new Date().getTime()
    });

    axios
      .post(
        url + 'users/login',
        email && password
          ? { email: email, password: password }
          : { isGuest: true },
        { withCredentials: true }
      )
      .then((res) => {
        const userId = res.data;
        if (!userId) {
          this.error('Login failed', 'Invalid username or password.');
          localStorage.removeItem('login');
          return;
        }

        // Disconnect the socket server first
        if (this.socket && this.socket.connected) this.disconnect();

        Terminal.log('✔️ Logged in as', userId);

        // Populate my user data

        if (staySignedIn && email && password) {
          // Save login data
          localStorage.setItem(
            'login',
            JSON.stringify({
              email: email,
              password: password
            })
          );

          Terminal.log('🔑', 'Login credentials saved to local storage');
        }

        this.me = new MyUserData();
        this.me.id = userId;

        this.connect();
      })
      .catch((err) => {
        console.log(err.response);
        if (err.response.status === 401 || err.response.status === 400) {
          this.error('Login failed', 'Invalid username or password.');
          localStorage.removeItem('login');
        } else this.error('Login failed', `${err.code}: ${err.message}`);

        return;
      });
  }

  public logout() {
    this.disconnect();

    // Clear stored login credentials
    localStorage.removeItem('login');

    // Reload the page
    window.location.reload();
  }

  public cheat(type: string, value: string): void {
    Terminal.log('⭐', 'Cheating', type, value, '...');

    axios
      .post(
        `${url}cheat/?type=${type}&value=${value}`,
        { userID: this.me?.id },
        { withCredentials: true }
      )
      .then((res) => Terminal.log('✔️', 'Cheat successful'))
      .catch((err) => Terminal.log('⚠️', 'Cheat failed'));
  }

  public register(email: string, password: string) {
    PopupMediator.open(PopupLoading);

    Terminal.log('🔑', `Registering ${email} / ${password}`, '...');
    axios
      .post(
        url + 'users/registration',
        { email: email, password: password, userID: this.me!.id },
        { withCredentials: true }
      )
      .then((res) => {
        // Terminal.log('👀', res);
        Terminal.log('✔️ Registered');

        localStorage.setItem(
          'login',
          JSON.stringify({
            email: email,
            password: password
          })
        );

        Terminal.log('🔑', 'Login credentials saved to local storage');

        PopupMediator.close();
      })
      .catch((err) => {
        Terminal.log(err);
        this.error(
          'Registration failed',
          'Could not register an account with the provided email and password.'
        );
        return;
      });
  }

  public changeUsername(username: string) {
    Terminal.log('🔤', 'Changing username to', username, '...');
    axios
      .post(
        url + 'users/update',
        { id: this.me?.id, newUsername: username },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️ Username changed');
        PopupMediator.open(PopupSuccess, {
          title: 'Username changed',
          message: 'Your username has been changed successfully.'
        });
      })
      .catch((err) => Terminal.log('⚠️', err));
  }

  public changeAvatar(avatar: string) {
    Terminal.log('🔤', 'Changing avatar to', avatar, '...');
    axios
      .post(
        url + 'users/update',
        { id: this.me?.id, newAvatar: avatar },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Avatar changed');
      })
      .catch((err) => Terminal.log('⚠️', err));
  }

  public changeStatus(status: string) {
    Terminal.log('🔤', 'Changing status to', status, '...');
    axios
      .post(
        url + 'users/update',
        { id: this.me?.id, newStatus: status },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Status changed');
        PopupMediator.open(PopupSuccess, {
          title: 'Status changed',
          message: 'Your status has been changed successfully.'
        });
      })
      .catch((err) => Terminal.log('⚠️', err));
  }

  public changeEmail(currentPassword: string, email: string) {
    axios
      .post(
        url + 'users/update',
        {
          id: this.me?.id,
          password: currentPassword,
          newEmail: email
        },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Email changed');
        PopupMediator.open(PopupSuccess, {
          title: 'Email changed',
          message: 'Your Email has been changed successfully.'
        });
        const loginData = localStorage.getItem('login');
        if (loginData)
          localStorage.setItem(
            'login',
            JSON.stringify({
              email: email,
              password: JSON.parse(loginData).password
            })
          );
      })
      .catch((err) => {
        Terminal.log('⚠️', err);
        PopupMediator.open(PopupError, {
          title: 'Email change failed',
          message:
            'Your Email could not be changed. Did you enter your password correctly?'
        });
      });
  }

  public changePassword(currentPassword: string, newPassword: string) {
    Terminal.log('🔤', 'Changing password', '...');
    axios
      .post(
        url + 'users/update',
        {
          id: this.me?.id,
          password: currentPassword,
          newPassword: newPassword
        },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Password changed');
        PopupMediator.open(PopupSuccess, {
          title: 'Password changed',
          message: 'Your password has been changed successfully.'
        });

        const loginData = localStorage.getItem('login');
        if (loginData)
          localStorage.setItem(
            'login',
            JSON.stringify({
              email: JSON.parse(loginData).email,
              password: newPassword
            })
          );
      })
      .catch((err) => {
        Terminal.log('⚠️', err);
        PopupMediator.open(PopupError, {
          title: 'Password change failed',
          message:
            'Your password could not be changed. Did you enter your current password correctly?'
        });
      });
  }

  public changeWallpaper(wallpaper: string) {
    Terminal.log('🔤', 'Changing wallpaper to', wallpaper, '...');
    axios
      .post(
        url + 'users/update',
        { id: this.me?.id, newWallpaper: wallpaper },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Wallpaper changed');
      })
      .catch((err) => Terminal.log('⚠️', err));
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  // Connect to socket.io server
  public connect() {
    if (this.socket)
      return Terminal.log('❌', 'Cannot connect; Already connected');
    Terminal.log(`Connecting to ${url} as ${this.me!.id}`, '...');

    // TODO remove online:true; remove it from BE first, it's unnecessary
    this.socket = io(url, {
      query: {
        userID: this.me!.id,
        online: true
      }
    });

    if (DEV_MODE) setTimeout(doAfterLogin, 500);

    this.addSocketListeners();
  }

  // Disconnect from socket.io server
  public disconnect() {
    if (!this.socket || !this.socket.connected) {
      Terminal.log('❌', 'Cannot disconnect; Connect to a server first');
      return;
    }

    this.socket?.disconnect();
  }

  public chat(message: string) {
    this.socket?.emit('chat', message);
  }

  // Socket listeners
  private addSocketListeners() {
    this.socket?.on('connect', () => {
      Terminal.log(`✔️ Connected to ${url} as ${this.me!.id}`);
      this.emit(ConnectionEventType.CONNECT);
      this.emit(ConnectionEventType.USER_DATA_CHANGED);
      setTimeout(() => {
        this.setIsConnected(true);
        PopupMediator.close();

        // Has the user viewed the cookie popup?
        if (!localStorage.getItem('cookie-popup-viewed'))
          PopupMediator.open(PopupBook, cookie);
      }, 500);
    });

    this.socket?.on('level-up', (data: { level: number; gold: number }) => {
      Terminal.log('✔️', 'Level up');
      PopupMediator.open(PopupLevelUp, data);
    });

    this.socket?.on('online-users', (count) => {
      this.onlineUsers = count;
      this.emit(ConnectionEventType.ONLINE_USERS, count);
    });

    this.socket?.on('chat', (data: Chat) => {
      // Terminal.log('💬', JSON.stringify(data));
      this.chatMessages.push(data);
      this.emit(ConnectionEventType.CHAT_MESSAGE, data);
    });

    this.socket?.on('invalidate-user', () => {
      this.invalidateUserData();
    });

    this.socket?.on('disconnect', () => {
      Terminal.log('✔️ Disconnected');
      this.setIsConnected(false);
      this.removeSocketListeners();
      this.socket = undefined;

      // Reload the page
      window.location.reload();
    });
  }

  private invalidateUserData() {
    // User data invalidated, update it
    Terminal.log('🔥 User data invalidated, validating my data ...');

    axios
      .get(url + `users/${this.me!.id}`, { withCredentials: true })
      .then((res) => {
        const data = res.data;
        this.me = MyUserData.create(data);

        Terminal.log('✔️', 'Validated user data');
        this.emit(ConnectionEventType.USER_DATA_CHANGED);
      });
  }

  private removeSocketListeners() {
    this.socket?.removeAllListeners();
  }

  // Terminal listeners trigger Connection functions
  private addTerminalListeners() {
    Terminal.instance.on(TerminalEventType.COMMAND, (cmd) => {
      const arr = cmd.split(' ');
      cmd = arr.shift();

      switch (cmd) {
        case 'me':
          this.getMe();
          break;
        case 'login':
          this.login(arr[0], arr[1]);
          break;
        case 'register':
          this.register(arr[0], arr[1]);
          break;
        case 'logout':
          this.logout();
          break;
        case 'cheat':
          this.cheat(arr[0], arr[1]);
          break;
        case 'connect':
          this.connect();
          break;
        case 'disconnect':
          this.disconnect();
          break;
        case 'chat':
          this.chat(arr.join(' '));
          break;
        case 'game/list':
        case 'gl':
          this.listGames();
          break;
        case 'game/host':
        case 'gh':
          const gameOptions: GameOptions = {
            name: `${this.me?.username}'s Game`,
            description: 'This game was started from the terminal',
            password: '',
            categories: [GameCategory.GENERAL_KNOWLEDGE]
          };
          this.hostGame(gameOptions);
          break;
        case 'game/join':
        case 'gj':
          this.joinGame(arr[0]);
          break;
        case 'game/start':
        case 'gs':
          this.startGame();
          break;
        case 'game/leave':
        case 'ge':
          this.leaveGame();
          break;
        case 'send':
          if (arr.length === 0)
            return Terminal.log('⚠️', 'No event type to send');

          let payload = {};
          Terminal.log(arr.join(', '));
          if (arr.length > 1) {
            try {
              payload = JSON.parse(arr[1]);
            } catch (e) {
              // Payload is not JSON
              payload = arr[1];
            }
          }

          this.sendCustomEvent(arr[0], payload);
      }
    });
  }

  public buyItem(id: string) {
    axios
      .post(
        url + 'shop/buy',
        { userID: this.me?.id, itemID: id },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Item bought');
      })
      .catch((err) => Terminal.log('⚠️', err));
  }

  public hostGame(gameOptions: GameOptions) {
    axios
      .post(
        url + 'game/host',
        { userID: this.me?.id, gameOptions: gameOptions },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Game created successfully');
        const gameId = res.data;
        this.joinGame(gameId);
      })
      .catch((err) => {
        Terminal.log('⚠️', 'Could not host game');
      });
  }

  public joinGame(gameID: string) {
    axios
      .post(
        url + 'game/join',
        { userID: this.me?.id, gameID: gameID },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Game joined');
        this.me!.gameID = gameID;
        this.game = new Game(this.socket!);
      })
      .catch((err) => {
        Terminal.log('⚠️', 'Could not join game');
      });
  }

  public joinRandomGame() {
    // Join a random game from the game list
    // Get the game list
    console.log('play now');
    axios.get(url + 'game/list').then((res) => {
      const list = res.data;
      console.log(list);
      if (list.length === 0) {
        // Host a game
        const gameOptions: GameOptions = {
          name: `${this.me?.username}'s Game`,
          description: `I can't wait to play!`,
          password: '',
          categories: [GameCategory.GENERAL_KNOWLEDGE]
        };
        this.hostGame(gameOptions);
      } else {
        // Join a random game
        const gameId = list[Math.floor(Math.random() * list.length)].gameID;
        console.log('joining', gameId);
        this.joinGame(gameId);
      }
    });
  }

  public leaveGame() {
    axios
      .post(
        url + 'game/leave',
        { userID: this.me?.id },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Left game');
        this.game?.dispose();
        this.game = undefined;
        console.log('🗑️', 'Game disposed');
        this.invalidateUserData();
      })
      .catch((err) => {
        Terminal.log('⚠️', 'Could not leave game');
      });
  }

  public listGames() {
    axios.get(url + 'game/list').then((res) => {
      const data = res.data;
      Terminal.log('✔️', JSON.stringify(data, null, 2));
    });
  }

  public startGame() {
    axios
      .post(
        url + 'game/start',
        { userID: this.me?.id },
        { withCredentials: true }
      )
      .then((res) => {
        Terminal.log('✔️', 'Game started');
      })
      .catch((err) => {
        Terminal.log('⚠️', 'Could not start game');
      });
  }

  private sendCustomEvent(eventType: string, payload: any) {
    this.socket?.emit(eventType, payload);
  }
}

export enum OnlineStatus {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

export class UserData {
  id?: string;
  isGuest?: boolean;
  username?: string;
  currentAvatar?: string;
  level?: number;
  status?: OnlineStatus.ONLINE | OnlineStatus.OFFLINE;
}

export class MyUserData extends UserData {
  email?: string;
  currentSkin?: string;
  currentWallpaper?: string;
  gold?: number;
  experience?: number;
  friends?: UserData[];
  friendRequestsIncoming?: UserData[];
  friendRequestsOutgoing?: UserData[];
  inventory?: string[]; // Item IDs
  gameID?: string | null;

  static create(data: Object) {
    const myUserData = new MyUserData();
    Object.assign(myUserData, data);
    return myUserData;
  }

  public getItems(): Item[] {
    return this.inventory!.map((itemId) => getItemById(itemId)!);
  }
}
