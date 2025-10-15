import {
    WebGPURenderer,
    PerspectiveCamera,
    Scene,
    MathUtils
} from "three/webgpu"

class Game {
    static instanced: Game
    private renderer: WebGPURenderer = null!

    scene: Scene | null = null
    camera: PerspectiveCamera | null = null

    updateFunction: ((_time: DOMHighResTimeStamp, _delta: number) => void) | null = null

    width: number = 0
    height: number = 0

    private lastTime: number = 0

    constructor() {
        if (Game.instanced) return Game.instanced
        Game.instanced = this
    }

    init = (
        canvas: OffscreenCanvas,
        width: number,
        height: number,
        pixelRatio: number
    ) => {
        this.width = width
        this.height = height

        this.renderer = new WebGPURenderer({ canvas: canvas, antialias: true })
        this.renderer.setSize(width, height, false)
        this.renderer.setPixelRatio(pixelRatio)

        this.camera = new PerspectiveCamera(60, width / height, 0.1, 1000)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        this.create()

        this.renderer.setAnimationLoop(this.update)
    }

    resize = (
        width: number,
        height: number
    ) => {
        this.width = width
        this.height = height

        if (this.camera) {
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        }

        this.renderer.setSize(width, height, false)
    }

    protected create(){}

    private update = async(_time: DOMHighResTimeStamp) => {
        const _delta: number = (_time - this.lastTime) / 1000
        this.lastTime = _time

        if (this.updateFunction) this.updateFunction(_time, _delta)
        if (this.scene && this.camera) this.renderer.renderAsync(this.scene, this.camera)
    }

    pointerDrag = (dx: number, dy: number, buttons: number) => {
        if (this.camera) {
            if (buttons & 2) {
                this.camera.rotation.x -= dy
                this.camera.rotation.x = Math.max(MathUtils.degToRad(-90), Math.min(MathUtils.degToRad(90), this.camera.rotation.x))

                this.camera.rotation.y -= dx
            }
        }
    }
}

export default Game