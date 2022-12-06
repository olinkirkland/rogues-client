import { Terminal, TerminalEventType } from '../controllers/TerminalController';
import { useState, useEffect } from 'react';

function TerminalOverlay() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Terminal.instance.on(TerminalEventType.CHANGE, onTerminalChange);
    return () => {
      Terminal.instance.off(TerminalEventType.CHANGE, onTerminalChange);
    };
  }, []);

  const onTerminalChange = (event) => {
    setLogs((prevLogs) => [...Terminal.logs]);

    setTimeout(() => {
      const terminalBody = document.querySelector('.terminal__body');
      if (
        terminalBody.scrollTop + terminalBody.clientHeight >=
        terminalBody.scrollHeight - 50
      ) {
        // Smoothly scroll to the bottom
        terminalBody.scrollTo({
          top: terminalBody.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  };

  return (
    <div id="terminal">
      <button className="terminal__close-button">
        <i className="fas fa-times"></i>
      </button>

      <h2>Terminal</h2>

      <div className="terminal__body">
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>

      {/* <div className="terminal__input">
        <input type="text" placeholder="Enter command..." />
        <button className="terminal__input-button">
          <i className="fas fa-arrow-right"></i>
        </button>
      </div> */}
    </div>
  );
}

export default TerminalOverlay;
