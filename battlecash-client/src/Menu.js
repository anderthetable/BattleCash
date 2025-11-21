import { Network } from "./App";

function Menu({ startGame, connectWallet, network, setNetwork }) {
  return (
    <div className='app-menu'>
      <div>
        <label style={{ marginRight: '1rem' }} htmlFor='network'>
          Network:
        </label>
        <select value={network} name='network' id='network' onChange={(e) => setNetwork(e.target.value)}>
          <option value={Network.MOCKNET}>Mocknet</option>
          <option value={Network.TESTNET}>Chipnet</option>
          <option value={Network.MAINNET}>Mainnet</option>
        </select>
      </div>
      {network !== Network.MOCKNET && (
        <div>
          <input className='app-menu__start' type='button' onClick={connectWallet} value='Wallet Connect' />
        </div>
      )}
      <input className='app-menu__start' type='button' onClick={startGame} value='Start' />
    </div>
  )
}

export default Menu;
