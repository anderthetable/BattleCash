import { useState, useEffect } from 'react';
import { MockNetworkProvider } from 'cashscript';
import Menu from './Menu';
import Lobby from './Lobby';
import Arena from './Arena';

import './App.css';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [provider] = useState(new MockNetworkProvider());
  const [lobby, setLobby] = useState({ arenas: [], myChampions: [] });
  const [arena, setArena] = useState({ inArena: false, active: null });
  const onEnterArena = opponent => {
    console.log('you are challenging', opponent);
    setArena(a => ({
      inArena: true,
      active: {
        opponent: {
          id: '2',
          name: 'Anon2',
          nft: '0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640 ',
          imageUrl: 'https://nfts.bch.guru/img/drops/2.png',
        },
        myChampion: {
          id: '1', // unique id
          name: 'My Champion 1',
          nft: '0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640 ',
          imageUrl: 'missing.png',
        }
      }
    }));
  };
  const onLobbyExit = () => {
    setInitialized(false);
  };
  // use the effect to call your api and/or bitcoin blockchain lobby data
  useEffect(() => {
    setLobby({
      arenas: [ // would need to use an api or additional contrct to check who is waiting
        {
          id: '1', // unique id
          name: 'Anon1',
          nft: '0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640 ',
          imageUrl: 'https://nfts.bch.guru/img/drops/1.png',
          // any additional data and state data
          challengeExtended: false,
          acceptedChallenge: false,
        },
        {
          id: '2',
          name: 'Anon2',
          nft: '0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640 ',
          imageUrl: 'https://nfts.bch.guru/img/drops/2.png',
        },
      ],
      myChampions: [
        {
          id: '3', // unique id
          name: 'My Champion 1',
          nft: '0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640 ',
          imageUrl: 'missing.png',
          // any additional data and state data
          challengeExtended: false,
          acceptedChallenge: false,
        },
        {
          id: '4',
          name: 'My Champion 2',
          nft: '0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640 ',
          imageUrl: 'https://nfts.bch.guru/img/drops/2.png',
        },
      ]
    });
  }, []);
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
          initialized && !arena.inArena && (
            <Lobby onEnterArena={onEnterArena} onLobbyExit={onLobbyExit} lobby={lobby} />
          )
        }
        {
          initialized && arena?.inArena && (
            <Arena onReturn={() => setArena(a => ({ ...a, inArena: false }))} {...arena} />
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
