import { useState } from 'react';
import cn from 'classnames';

function Arena({ onReturn, active }) {
    const [activeDamage, setActiveDamage] = useState(0);
    const [finished, setFinished] = useState(false);
    const onOpponentDamaged = e => setActiveDamage(1);
    const onAnimationEnd = e => {
        setActiveDamage(0);
        setFinished(true);
    };
    return (
        <div className='app-arena'>
            {
                !finished && (
                    <>
                        <div className='app-arena_player app-arena_opponent'>
                            <img className={cn('app-arena_nft', { 'app-arena_nft--damage': activeDamage === 1 })} src={active.opponent.imageUrl} onAnimationEnd={onAnimationEnd} />
                        </div>
                        <div className='app-arena_message'>
                            Preparing for Battle!
                        </div>
                        <div className='app-arena_player app-arena_user'>
                            <img className='app-arena_nft' src={active.myChampion.imageUrl} />
                        </div>
                        <div style={{ display: 'grid', gridAutoFlow: 'column', columnGap: '2rem' }}>
                            <input type='button' onClick={onReturn} value='Back' />
                            <input type='button' onClick={onOpponentDamaged} value='Attack' />
                        </div>
                    </>
                )
            }
            {
                finished && (
                    <div
                        style={{
                            display: 'grid',
                            rowGap: '1rem',
                            padding: '1rem',
                        }}
                    >
                        <div>
                            Winner!
                        </div>
                        <div>
                            <img className='app-arena_nft' src={active.myChampion.imageUrl} />
                        </div>
                        <div>
                            <input type='button' onClick={onReturn} value='Back' />
                        </div>
                    </div>
                )
            }

        </div>
    )
}

export default Arena;
