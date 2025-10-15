import Plugin from "@engine/plugin"
import Scene from "@engine/scene"

import {
    Color,
    Group,
    MathUtils,
    Mesh,
    MeshStandardNodeMaterial,
    NoColorSpace,
    Object3D,
    PlaneGeometry,
    RectAreaLight,
    RectAreaLightNode,
    RepeatWrapping,
    SRGBColorSpace,
    Texture,
    type Object3DEventMap
} from "three/webgpu"

import {
    texture,
    bumpMap,
    float,
    color
} from "three/tsl"

import { RectAreaLightTexturesLib } from "three/examples/jsm/lights/RectAreaLightTexturesLib.js"
import type { GLTF } from "three/examples/jsm/Addons.js"

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

        // TV

        Plugin.gltfLoader.load("models/tv.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.scale.set(4, 4, 4)
            model.position.set(0, 0, -1)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    if (object.name === "Screen") {
                        const screenMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
                        screenMaterial.colorNode = color(1, 1, 1)
                        screenMaterial.emissiveNode = color(1, 1, 1)

                        object.material = screenMaterial
                    }
                }
            })

            this.scene.add(model)
        })

        // Camera

        this.camera.position.set(0, 2, 5)
        this.cameraLookAt(0, 0.5, 0)

        // Lightings

        RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init())

        const frontAreaLight: RectAreaLight = new RectAreaLight(0xffffff, 0.01, 10, 5)
        frontAreaLight.position.set(0, 2.5, 5)

        const leftAreaLight: RectAreaLight = new RectAreaLight(new Color(0.247, 0.68, 1), 0.02, 10, 5)
        leftAreaLight.position.set(-4.9, 2.5, 0)
        leftAreaLight.rotation.y = MathUtils.degToRad(-90)

        const rightAreaLight: RectAreaLight = new RectAreaLight(new Color(0.95, 0.67, 0.67), 0.02, 10, 5)
        rightAreaLight.position.set(4.9, 2.5, 0)
        rightAreaLight.rotation.y = MathUtils.degToRad(90)

        this.scene.add(frontAreaLight, leftAreaLight, rightAreaLight)
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