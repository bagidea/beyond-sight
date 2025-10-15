import Game from "./game"

import {
    Color,
    Scene as _Scene,
    PerspectiveCamera,
    WebGPURenderer,
    Vector3,
    Euler
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
        this.camera = this.game.camera

        this.start()
        this.game.updateFunction = this.update
    }

    protected start() {}
    protected update(_time: DOMHighResTimeStamp, _delta: number) {}

    cameraLookAt = (x: number, y: number, z: number) => {
        if (!this.camera) return

        const target: Vector3 = new Vector3(x, y, z)
        this.camera.lookAt(target)

        const euler: Euler = new Euler().setFromQuaternion(this.camera.quaternion, "YXZ")

        this.game.cameraRotationUpdate(euler.x, euler.y)
    }

}

export default Scene