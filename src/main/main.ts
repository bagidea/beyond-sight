// Scenes
import Game from "@engine/game"

import Menu from "./scenes/menu"

class Main extends Game {
    create = () => {
        new Menu()
    }
}

export default Main