import Plugin from "@engine/plugin"
import Scene from "@engine/scene"

import {
    PlaneGeometry,
    MathUtils,
    DirectionalLight,
    InstancedMesh,
    Object3D,
    MeshStandardNodeMaterial,
    NoColorSpace,
    Texture,
    RepeatWrapping,
    SRGBColorSpace,
    ReflectorNode
} from "three/webgpu"

import {
    color,
    float,
    reflector,
    texture
} from "three/tsl"

import type { ShaderNodeObject } from "three/tsl"

class Level1 extends Scene {
    // 5 x 5
    private maps: Array<Array<number>> = [
        [ 0, 1, 1, 0, 0 ],
        [ 0, 1, 0, 0, 0 ],
        [ 1, 1, 1, 1, 1 ],
        [ 1, 0, 1, 0, 0 ],
        [ 1, 0, 0, 0, 0 ]
    ]

    createMap = async() => {
        const dummy: Object3D = new Object3D()

        const groundGeometry: PlaneGeometry = new PlaneGeometry(10, 10)
        const groundMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()

        const groundImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/lavatile.jpg")

        const groundTexture: Texture = new Texture(groundImageBitmap)
        this.setupTexture(groundTexture, 1, 1, NoColorSpace)

        const reflection: ShaderNodeObject<ReflectorNode> = reflector()
        reflection.target.rotation.x = MathUtils.degToRad(-90)

        this.scene.add(reflection.target)

        groundMaterial.colorNode = color(1, 1, 1)
        groundMaterial.envNode = reflection.mul(0.2)
        groundMaterial.roughnessNode = texture(groundTexture).mul(0.3)
        groundMaterial.metalnessNode = float(0.9)

        const ground: InstancedMesh = new InstancedMesh(groundGeometry, groundMaterial, 5 * 5)
        this.scene.add(ground)

        for (let z: number = 0; z < this.maps.length; z++) {
            for (let x: number = 0; x < this.maps[z].length; x++) {
                if (this.maps[z][x]) {
                    dummy.position.set(x * 10, 0, z * 10)
                    dummy.rotation.x = MathUtils.degToRad(-90)
                    dummy.scale.set(1, 1, 1)
                    dummy.updateMatrix()
                } else {
                    dummy.position.set(0, -50, 0)
                    dummy.scale.set(0, 0, 0)
                    dummy.updateMatrix()
                }

                ground.setMatrixAt(z * 5 + x, dummy.matrix)
            }
        }
    }

    private setupTexture = (texture: Texture, x: number, y: number, colorSpace: string = SRGBColorSpace) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(x, y)
        texture.colorSpace = colorSpace
        texture.needsUpdate = true
    }

    start = () => {
        // Create Map
        this.createMap()

        this.camera.position.set(5, 10, 4 * 10 + 5)
        this.cameraLookAt(0, 0, 4 * 10)

        // Lightings
        const directionalLight: DirectionalLight = new DirectionalLight(0xffffff)
        directionalLight.position.set(5, 10, 5)
        this.scene.add(directionalLight)

        this.game.action("loading_gui_none", true, 3)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
    }
}

export default Level1