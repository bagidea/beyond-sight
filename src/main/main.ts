// Scenes
import Game from "@engine/game"
import Scene from "@engine/scene"

import Menu from "./scenes/menu"
import Level1 from "./scenes/level_1"

class Main extends Game {
    gameScene: Scene | null = null

    create = () => {
        //this.gameScene = new Menu()
        this.gameScene = new Level1()
    }

    loadGameScene = (name: string) => {
        switch (name) {
            case "main":
                this.gameScene = new Menu()

                break
            case "level_1":
                this.gameScene = new Level1()

                break
            case "level_2":
                break
            case "level_3":
                break
            case "level_4":
                break
            case "level_5":
                break
            default:
                console.log("Not found scene name "+name)
        }
    }
}

export default Main