import Plugin from "@engine/plugin"
import Scene from "@engine/scene"

import {
    DirectionalLight,
    MathUtils,
    Mesh,
    MeshStandardNodeMaterial,
    PlaneGeometry,
    RepeatWrapping,
    Texture
} from "three/webgpu"

import {
    texture
} from "three/tsl"

class Menu extends Scene {
    start = () => {
        // Ground

        const groundGeometry: PlaneGeometry = new PlaneGeometry(10, 10)
        const groundMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()

        const ground: Mesh = new Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = MathUtils.degToRad(-90)

        this.scene.add(ground)

        // Walls

        const wallGeometry: PlaneGeometry = new PlaneGeometry(10, 5)
        const wallMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()

        Plugin.imageBitmapLoader.load("textures/brick_diffuse.jpg", (data: ImageBitmap) => {
            const tex: Texture = new Texture(data)
            tex.wrapS = RepeatWrapping
            tex.repeat.set(2, 1)
            tex.needsUpdate = true

            wallMaterial.colorNode = texture(tex)

            const wallBack: Mesh = new Mesh(wallGeometry, wallMaterial)
            wallBack.position.set(0, 2.5, -5)

            this.scene.add(wallBack)
        })

        // Camera

        this.camera.position.set(0, 2, 5)
        this.cameraLookAt(0, 1, 0)

        // Lightings

        const directionalLight: DirectionalLight = new DirectionalLight(0xffffff, 1)
        directionalLight.position.set(10, 10, 10)

        this.scene.add(directionalLight)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
    }
}

export default Menu