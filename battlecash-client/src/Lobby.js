import React from 'react';

import Opponents from './Opponents';
import MyChampions from './MyChampions';

function Lobby({ lobby, onEnterArena, onLobbyExit, walletConnectAddress }) {
    const textEllipsisStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };
    return (
        <div
            style={{
                display: 'grid',
                rowGap: '2rem',
                padding: '1.5rem',
                border: 'solid 1px white',
                borderRadius: '1rem',
            }}
        >
            <div>
                <input type='button' value='Back' onClick={onLobbyExit} />
                <p>Wallet: {walletConnectAddress ? walletConnectAddress : "Not connected"}</p>
            </div>
            <Opponents lobby={lobby.arenas} onEnterArena={onEnterArena} />
            <MyChampions lobby={lobby.myChampions} onEnterArena={onEnterArena} />
        </div>
    )
}

export default Lobby;
