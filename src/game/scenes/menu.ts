import {
    BoxGeometry,
    Color,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene
} from "three/webgpu"

import Game from "../game"

class Menu {
    private game: Game = null!

    private box: Mesh = null!

    constructor() {
        this.game = new Game()
    }

    init = () => {
        this.game.scene = new Scene()
        this.game.scene.background = new Color(0x000000)

        this.game.camera = new PerspectiveCamera(60, this.game.width / this.game.height, 0.1, 1000)
        this.game.camera.position.set(3, 3, 3)
        this.game.camera.lookAt(0, 0, 0)

        this.start()

        this.game.updateFunction = this.update
    }

    start = () => {
        this.box = new Mesh(
            new BoxGeometry(),
            new MeshBasicMaterial()
        )

        this.game.scene?.add(this.box)
    }

    update = () => {
        this.box.rotation.y += 0.01
    }
}

export default Menu