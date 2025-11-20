import React from 'react';

import Opponents from './Opponents';
import MyChampions from './MyChampions';

function Lobby(props) {
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
                <input type='button' value='Back' onClick={props.onLobbyExit} />
            </div>
            <Opponents {...props} />
            <MyChampions {...props} />
        </div>
    )
}

export default Lobby;
