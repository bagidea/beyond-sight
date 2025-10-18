import {
    WebGPURenderer,
    PerspectiveCamera,
    Scene,
    MathUtils,
    Vector3,
    Quaternion,
    Euler,
    PostProcessing,
    PassNode,
    TextureNode,
    ACESFilmicToneMapping
} from "three/webgpu"

import {
    emissive,
    mrt,
    output,
    pass,
} from "three/tsl"

import type { ShaderNodeObject } from "three/tsl"
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js"

class Game {
    static instanced: Game
    private self: Window & typeof globalThis = null!
    private renderer: WebGPURenderer = null!

    postProcessing: PostProcessing = null!
    scenePass: ShaderNodeObject<PassNode> | null = null

    scene: Scene | null = null
    camera: PerspectiveCamera | null = null

    updateFunction: ((_time: DOMHighResTimeStamp, _delta: number) => void) | null = null

    width: number = 0
    height: number = 0

    pointerX: number = 0
    pointerY: number = 0

    private lastTime: number = 0

    private rotationX: number = 0
    private rotationY: number = 0

    private forward: boolean = false
    private back: boolean = false
    private left: boolean = false
    private right: boolean = false
    private moveSpeed: boolean = false

    constructor() {
        if (Game.instanced) return Game.instanced
        Game.instanced = this
    }

    init = (
        self: Window & typeof globalThis,
        canvas: OffscreenCanvas,
        width: number,
        height: number,
        pixelRatio: number
    ) => {
        this.self = self

        this.width = width
        this.height = height

        this.renderer = new WebGPURenderer({ canvas: canvas, antialias: true })
        this.renderer.setSize(width, height, false)
        this.renderer.setPixelRatio(pixelRatio)
        this.renderer.toneMapping = ACESFilmicToneMapping

        this.camera = new PerspectiveCamera(60, width / height, 0.1, 1000)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        // PostProcessing //

        this.postProcessing = new PostProcessing(this.renderer)
        this.scenePass = null

        ////////////////////

        this.create()

        this.renderer.setAnimationLoop(this.update)
    }

    initPostProcessing = () => {
        if (this.scenePass || !this.scene || !this.camera) return

        this.scenePass = pass(this.scene, this.camera)

        this.scenePass.setMRT(mrt({
            output,
            emissive
        }))

        const outputPass: ShaderNodeObject<TextureNode> = this.scenePass.getTextureNode()
        const emissivePass: ShaderNodeObject<TextureNode> = this.scenePass.getTextureNode("emissive")

        const bloomPass = bloom(emissivePass, 2.5, 0.5)

        this.postProcessing.outputNode = outputPass.add(bloomPass)
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

        if (this.scene && this.camera) {
            if (!this.scenePass)
                this.renderer.renderAsync(this.scene, this.camera)
            else
                this.postProcessing.renderAsync()
        }
    }

    action = (action: string, open: boolean, delay: number = 0) => {
        setTimeout(() => {
            this.self.postMessage({ type: action, action: open })
        }, delay * 1000)
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

    pointerUpdate = (
        px: number,
        py: number
    ) => {
        this.pointerX = px
        this.pointerY = py
    }

    cameraMove = (_delta: number) => {
        if (!this.camera) return

        const speed: number = (5 * _delta) * (this.moveSpeed ? 5 : 1)

        const forward: Vector3 = new Vector3()
        this.camera.getWorldDirection(forward)

        const right: Vector3 = new Vector3()
        right.crossVectors(forward, this.camera.up).normalize()

        if (this.forward) this.camera.position.add(forward.clone().multiplyScalar(speed))
        if (this.back) this.camera.position.add(forward.clone().multiplyScalar(-speed))
        if (this.left) this.camera.position.add(right.clone().multiplyScalar(-speed))
        if (this.right) this.camera.position.add(right.clone().multiplyScalar(speed))
    }

    cameraKeys = (
        forward: boolean,
        back: boolean,
        left: boolean,
        right: boolean,
        moveSpeed: boolean
    ) => {
        this.forward = forward
        this.back = back
        this.left = left
        this.right = right,
        this.moveSpeed = moveSpeed
    }

    clearScene = () => {
        if (this.scene) {
            //console.log(this.scene.children)
        
            this.scene.remove(...this.scene.children)
        }
    }
}

export default Game