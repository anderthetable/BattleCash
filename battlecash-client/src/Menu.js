function Menu({ startGame }) {
  return (
    <div className='app-menu'>
      this is the menu
      <input className='app-menu__start' type='button' onClick={startGame} value='Start' />
    </div>
  )
}

export default Menu;
