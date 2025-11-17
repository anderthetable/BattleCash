import { useState } from 'react';
import cn from 'classnames';

function Arena() {
    const [activeDamage, setActiveDamage] = useState(0);
    const onOpponentDamaged = e => setActiveDamage(1);
    const onAnimationEnd = e => setActiveDamage(0);
    return (
        <div className='app-arena'>
            <div className='app-arena_player app-arena_opponent'>
                <img className={cn('app-arena_nft', { 'app-arena_nft--damage': activeDamage === 1 })} src='https://nfts.bch.guru/img/drops/1.png' onAnimationEnd={onAnimationEnd} />
            </div>
            <div className='app-arena_message'>
                Preparing for Battle!
            </div>
            <div className='app-arena_player app-arena_user'>
                <img className='app-arena_nft' src='https://nfts.bch.guru/img/drops/2.png' />
            </div>
            <div>
                <input type='button' onClick={onOpponentDamaged} value='Attack' />
            </div>
        </div>
    )
}

export default Arena;
