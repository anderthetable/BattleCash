import { useState } from 'react';
import Menu from './Menu';
import Arena from './Arena';

import './App.css';

function App() {
  const [initialized, setInitialized] = useState(false);
  return (
    <div className='app'>
      <header className='app-header'>
        <p>
          BattleCash
        </p>
      </header>
      <main className='app-main'>
        {
            !initialized && (
              <Menu startGame={() => setInitialized(true)} />
            )
          }
          {
            initialized && (
              <Arena />
            )
          }
      </main>
      <footer className='app-footer'>
        <div>
          BCHBlaze 2025
        </div>
      </footer>
    </div>
  );
}

export default App;
