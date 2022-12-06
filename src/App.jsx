import { useState, useEffect } from 'react';
import TerminalOverlay from './components/TerminalOverlay';
import { log } from './controllers/TerminalController';
import './css/styles.css';
import './css/terminal.css';
import { lorem } from './Util';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    // Start connection
    // const connection = Connection.instance;
    // connection.setIsConnected = setIsConnected;]
  }, []);

  return (
    <div>
      {/* <Platform /> */}
      <TerminalOverlay />
    </div>
  );
}

export default App;
