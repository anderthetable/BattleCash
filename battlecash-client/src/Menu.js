function Menu({ startGame }) {
  return (
    <div className='app-menu'>
      <div>
        <label style={{ marginRight: '1rem' }} htmlFor='network'>
          Network:
        </label>
        <select name='network' id='network'>
          <option value='mocknet'>Mocknet</option>
        </select>
      </div>
      <div>
        -- TODO: Wallet Connect --
      </div>
      <input className='app-menu__start' type='button' onClick={startGame} value='Start' />
    </div>
  )
}

export default Menu;
