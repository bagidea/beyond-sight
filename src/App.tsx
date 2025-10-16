import "./App.css"

const App = () => {
  return (
    <div id="container">
      <canvas id="game-canvas" />

      <div className="game-gui">
        <div className="game-gui_menu">
          <div className="game-gui_menu-title">BEYOND SIGHT</div>

          <div className="game-gui_menu-list">
            <div>START GAME</div>
            <div>TUTORIAL</div>
            <div>SETTINGS</div>
            <div>CREDIT</div>
          </div>

          <img src="LOGO_mini.png" />
          <div>VERSION 1.0.0</div>
          <div>[ GAME JAM ]</div>
        </div>

        <div className="game-gui_description">
          <div className="game-gui_description-top">
            <img src="LOGO_jam.png" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App