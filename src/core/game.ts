import {
    WebGPURenderer,
    PerspectiveCamera,
    Scene,
    MathUtils,
    Vector3,
    Quaternion,
    Euler
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

    private rotationX: number = 0
    private rotationY: number = 0

    private forward: boolean = false
    private back: boolean = false
    private left: boolean = false
    private right: boolean = false

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

        this.cameraMove(_delta)

        if (this.updateFunction) this.updateFunction(_time, _delta)
        if (this.scene && this.camera) this.renderer.renderAsync(this.scene, this.camera)
    }

    cameraRotationUpdate = (rotationX: number, rotationY: number) => {
        this.rotationX = rotationX
        this.rotationY = rotationY
    }

    pointerDrag = (
        dx: number,
        dy: number,
        buttons: number
    ) => {
        if (!this.camera) return

        if (buttons & 2) {
            this.rotationX -= dy
            this.rotationX = Math.max(MathUtils.degToRad(-90), Math.min(MathUtils.degToRad(90), this.rotationX))
            this.rotationY -= dx
        
            const quaternion: Quaternion = new Quaternion()
            quaternion.setFromEuler(new Euler(this.rotationX, this.rotationY, 0, "YXZ"))

            this.camera.quaternion.copy(quaternion)
        }
    }

    cameraMove = (_delta: number) => {
        if (!this.camera) return

        const moveSpeed: number = 5 * _delta

        const forward: Vector3 = new Vector3()
        this.camera.getWorldDirection(forward)

        const right: Vector3 = new Vector3()
        right.crossVectors(forward, this.camera.up).normalize()

        if (this.forward) this.camera.position.add(forward.clone().multiplyScalar(moveSpeed))
        if (this.back) this.camera.position.add(forward.clone().multiplyScalar(-moveSpeed))
        if (this.left) this.camera.position.add(right.clone().multiplyScalar(-moveSpeed))
        if (this.right) this.camera.position.add(right.clone().multiplyScalar(moveSpeed))
    }

    cameraKeys = (
        forward: boolean,
        back: boolean,
        left: boolean,
        right: boolean
    ) => {
        this.forward = forward
        this.back = back
        this.left = left
        this.right = right
    }
}

export default Game