import Game from "./game"

import {
    Color,
    Scene as _Scene,
    PerspectiveCamera,
    WebGPURenderer
} from "three/webgpu"

class Scene {
    protected game: Game = null!

    protected renderer: WebGPURenderer = null!
    protected camera: PerspectiveCamera = null!
    protected scene: _Scene = null!

    constructor() {
        this.game = new Game()
        queueMicrotask(() => this.init())
    }

    init = () => {
        this.game.scene = new _Scene()
        this.game.scene.background = new Color(0x000000)
        this.scene = this.game.scene

        this.game.camera = new PerspectiveCamera(60, this.game.width / this.game.height, 0.1, 1000)
        this.game.camera.position.set(3, 3, 3)
        this.game.camera.lookAt(0, 0, 0)

        this.camera = this.game.camera

        this.start()
        this.game.updateFunction = this.update
    }

    protected start() {}
    protected update(_time: DOMHighResTimeStamp, _delta: number) {}
}

export default Scene