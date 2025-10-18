import "./App.css"

const App = () => {
  return (
    <div id="container">
      <canvas id="game-canvas" />

      <div
        id="loading_gui"
        className="loading-gui"
      >
        <div className="loading-gui_bg"></div>

        <div className="loading-gui_frame">
          <div
            id="loading_logo"
            className="loading-gui_logo">BEYOND SIGHT
          </div>
        </div>

        <div
          id="loading_bar"
          className="loading-bar"
        >
          <div className="loading-bar-fill"></div>
        </div>

        <div id="loading-play-btn">PLAY</div>
      </div>

      <div className="game-gui">
        <div
          id="main_menu"
          className="game-gui_menu"
        >
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

        <div
          id="main_description"
          className="game-gui_description"
        >
          <div className="game-gui_description-top">
            <img src="LOGO_jam.png" />

            <div>Hello! This project was created for the GameDev.tv Halloween Jam 2025.</div>
            <div>I’m really happy to be part of this event. it’s actually my very first Game Jam!</div>
            <div>I hope you enjoy playing my game as much as I enjoyed making it.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App