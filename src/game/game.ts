import {
    WebGPURenderer,
    PerspectiveCamera,
    Scene,
    Color,
    Mesh,
    BoxGeometry,
    MeshBasicNodeMaterial
} from "three/webgpu"

class Game {
    private renderer: WebGPURenderer = null!
    private scene: Scene = null!
    private camera: PerspectiveCamera = null!

    private box: Mesh = null!

    init = (
        canvas: OffscreenCanvas,
        width: number,
        height: number,
        pixelRatio: number
    ) => {
        this.renderer = new WebGPURenderer({ canvas: canvas, antialias: true })
        this.renderer.setSize(width, height, false)
        this.renderer.setPixelRatio(pixelRatio)

        this.scene = new Scene()
        this.scene.background = new Color(0x000000)

        this.camera = new PerspectiveCamera(60, width / height, 0.1, 1000)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        //////////////////////////////////

        this.box = new Mesh(
            new BoxGeometry(),
            new MeshBasicNodeMaterial()
        )

        this.scene.add(this.box)

        this.camera.position.set(3, 3, 3)
        this.camera.lookAt(0, 0, 0)

        //////////////////////////////////

        this.renderer.setAnimationLoop(this.update)
    }

    resize = (
        width: number,
        height: number
    ) => {
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height, false)
    }

    update = async(_time: DOMHighResTimeStamp) => {
        this.box.rotation.y += 0.01

        this.renderer.renderAsync(this.scene, this.camera)
    }
}

export default Game