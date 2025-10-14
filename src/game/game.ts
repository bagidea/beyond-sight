import {
    WebGPURenderer,
    PerspectiveCamera,
    Scene
} from "three/webgpu"

import Menu from "./scenes/menu"

class Game {
    static instanced: Game
    private renderer: WebGPURenderer = null!

    scene: Scene | null = null
    camera: PerspectiveCamera | null = null

    updateFunction: (() => void) | null = null

    width: number = 0
    height: number = 0

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

    create = () => {
        const menu: Menu = new Menu()
        menu.init()
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

    update = async(_time: DOMHighResTimeStamp) => {
        if (this.updateFunction) this.updateFunction()
        if (this.scene && this.camera) this.renderer.renderAsync(this.scene, this.camera)
    }
}

export default Game