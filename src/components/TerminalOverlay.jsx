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

  const onKeyPressTerminalInput = (event) => {
    if (event.key === 'Enter') {
      submitTerminalInput();
    }
  };

  const onClickTerminalInputButton = (event) => {
    submitTerminalInput();
  };

  const submitTerminalInput = () => {
    const input = document.querySelector('.terminal__input input').value;

    const isValid = Terminal.execute(input);
    if (isValid) {
      document.querySelector('.terminal__input input').value = '';
      return;
    }

    const terminalInput = document.querySelector('.terminal__input');
    terminalInput.classList.add('shake');
    setTimeout(() => {
      terminalInput.classList.remove('shake');
    }, 500);
  };

  return (
    <div id="terminal">
      <div className="terminal__header">
        <button className="terminal__header__close-button">
          <i className="fas fa-times"></i>
        </button>

        <h2>Terminal</h2>
      </div>

      <div className="terminal__body">
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>

      <div className="terminal__input">
        <input
          type="text"
          placeholder="Enter command..."
          onKeyUp={onKeyPressTerminalInput}
        />
        <button
          className="terminal__input-button"
          onClick={onClickTerminalInputButton}
        >
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}

export default TerminalOverlay;
