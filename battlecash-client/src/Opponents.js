import React from 'react';

function Opponents({ onEnterArena, lobby }) {
    const textEllipsisStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };
    return (
        <div style={{
            height: '100%',
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            display: 'grid',
            alignContent: 'start',
            rowGap: '1.5rem',
            gridTemplateColumns: '1fr 2fr 1fr auto 1fr',
            alignItems: 'center',
        }}>
            <div><h3>Challengers</h3></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div key='name'>Name</div>
            <div key='nft'>NFT Category</div>
            <div key='image'></div>
            <div key='state' style={{ justifySelf: 'center' }}>State</div>
            <div key='actions'></div>
            {
                lobby?.map(u => (
                    <React.Fragment
                        key={u.id}
                    >
                        <div style={textEllipsisStyle}>
                            {u.name}
                        </div>
                        <div style={textEllipsisStyle} title={u.nft}>
                            {u.nft}
                        </div>
                        <div style={{ display: 'grid', justifySelf: 'center' }}>
                            <img src={u.imageUrl} style={{ width: '4rem', height: '4rem' }} />
                        </div>
                        <div style={{ justifySelf: 'center' }}>
                            &mdash;
                        </div>
                        <div style={{ justifySelf: 'end' }}>
                            <input type='button' value='Challenge' onClick={() => onEnterArena(u)} />
                        </div>
                    </React.Fragment>
                ))
            }
        </div>
    )
}

export default Opponents;
