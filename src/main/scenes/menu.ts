import Plugin from "@engine/plugin"
import Scene from "@engine/scene"

import {
    MathUtils,
    Mesh,
    MeshStandardNodeMaterial,
    NoColorSpace,
    PlaneGeometry,
    RepeatWrapping,
    SRGBColorSpace,
    Texture
} from "three/webgpu"

import {
    texture,
    bumpMap,
    float,
    color
} from "three/tsl"

class Menu extends Scene {
    start = async() => {
        // Ground and Top

        const groundGeometry: PlaneGeometry = new PlaneGeometry(10, 10)
        const groundMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()

        const groundImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/lavatile.jpg")

        const groundTexture: Texture = new Texture(groundImageBitmap)
        this.setupTexture(groundTexture, 2, 2, NoColorSpace)

        groundMaterial.colorNode = color(1, 1, 1)
        groundMaterial.roughnessNode = texture(groundTexture).mul(0.4)
        groundMaterial.metalnessNode = float(1)

        const ground: Mesh = new Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = MathUtils.degToRad(-90)

        const top: Mesh = ground.clone()
        top.position.set(0, 5, 0)
        top.rotation.x = MathUtils.degToRad(90)

        this.scene.add(ground, top)

        // Walls

        const wallGeometry: PlaneGeometry = new PlaneGeometry(10, 5)
        const wallMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()

        const wallDiffuseImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/brick_diffuse.jpg")
        const wallBumpImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/brick_bump.jpg")

        const wallDiffuseTexture: Texture = new Texture(wallDiffuseImageBitmap)
        this.setupTexture(wallDiffuseTexture, 2, 1)

        const wallBumpTexture: Texture = new Texture(wallBumpImageBitmap)
        this.setupTexture(wallBumpTexture, 2, 1)

        wallMaterial.colorNode = texture(wallDiffuseTexture)
        wallMaterial.normalNode = bumpMap(texture(wallBumpTexture))
        wallMaterial.roughnessNode = float(0.3)

        const wallBack: Mesh = new Mesh(wallGeometry, wallMaterial)
        wallBack.position.set(0, 2.5, -5)

        const wallLeft: Mesh = wallBack.clone()
        wallLeft.position.set(-5, 2.5, 0)
        wallLeft.rotation.y = MathUtils.degToRad(90)

        const wallRight: Mesh = wallBack.clone()
        wallRight.rotation.y = MathUtils.degToRad(-90)
        wallRight.position.set(5, 2.5, 0)

        this.scene.add(wallBack, wallLeft, wallRight)

        // Camera

        this.camera.position.set(0, 2, 5)
        this.cameraLookAt(0, 1, 0)

        // Lightings
    }

    private setupTexture = (texture: Texture, x: number, y: number, colorSpace: string = SRGBColorSpace) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(x, y)
        texture.colorSpace = colorSpace
        texture.needsUpdate = true
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
    }
}

export default Menu