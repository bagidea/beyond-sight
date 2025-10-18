import Plugin from "@engine/plugin"
import Scene from "@engine/scene"

import {
    PlaneGeometry,
    MathUtils,
    InstancedMesh,
    Object3D,
    MeshStandardNodeMaterial,
    NoColorSpace,
    Texture,
    RepeatWrapping,
    SRGBColorSpace,
    ReflectorNode,
    //AmbientLight,
    //DirectionalLight,
    DoubleSide,
    RectAreaLightNode,
    RectAreaLight,
    Color,
    Mesh
} from "three/webgpu"

import {
    bumpMap,
    color,
    float,
    reflector,
    texture
} from "three/tsl"

import type { ShaderNodeObject } from "three/tsl"
import { RectAreaLightTexturesLib } from "three/examples/jsm/lights/RectAreaLightTexturesLib.js"

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
        dummy.rotation.x = MathUtils.degToRad(-90)
        const subDummy: Object3D = new Object3D()

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
        groundMaterial.roughnessNode = texture(groundTexture).mul(0.45)
        groundMaterial.metalnessNode = float(0.9)

        const grounds: InstancedMesh = new InstancedMesh(groundGeometry, groundMaterial, 25)
        this.scene.add(grounds)

        const wallGeometry: PlaneGeometry = new PlaneGeometry(10, 5)
        const wallMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
        wallMaterial.side = DoubleSide

        const wallDiffuseImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/damaged_plaster_diff_1k.jpg")
        const wallBumpImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/damaged_plaster_nor_gl_1k.jpg")

        const wallDiffuseTexture: Texture = new Texture(wallDiffuseImageBitmap)
        this.setupTexture(wallDiffuseTexture, 1, 1)

        const wallBumpTexture: Texture = new Texture(wallBumpImageBitmap)
        this.setupTexture(wallBumpTexture, 1, 1)

        wallMaterial.colorNode = texture(wallDiffuseTexture)
        wallMaterial.normalNode = bumpMap(texture(wallBumpTexture))
        wallMaterial.roughnessNode = float(0.4)
        wallMaterial.metalnessNode = float(0.2)

        const walls: InstancedMesh = new InstancedMesh(wallGeometry, wallMaterial, 100)
        this.scene.add(walls)

        for (let z: number = 0; z < this.maps.length; z++) {
            for (let x: number = 0; x < this.maps[z].length; x++) {
                if (this.maps[z][x]) {
                    dummy.position.set(x * 10, 0, z * 10)
                    dummy.scale.set(1, 1, 1)
                    dummy.updateMatrix()

                    // Walls setup

                    if (this.maps[z + 1]?.[x] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x, 2.5, dummy.position.z + 5)
                        subDummy.rotation.y = MathUtils.degToRad(180)
                        subDummy.scale.set(1, 1, 1)
                    }

                    subDummy.updateMatrix()
                    walls.setMatrixAt(z * 5 * 4 + x * 4, subDummy.matrix)

                    if (this.maps[z - 1]?.[x] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x, 2.5, dummy.position.z - 5)
                        subDummy.rotation.y = 0
                        subDummy.scale.set(1, 1, 1)
                    }

                    subDummy.updateMatrix()
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 1, subDummy.matrix)

                    if (this.maps[z][x - 1] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x - 5, 2.5, dummy.position.z)
                        subDummy.scale.set(1, 1, 1)
                        subDummy.rotation.y = MathUtils.degToRad(90)
                    }

                    subDummy.updateMatrix()
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 2, subDummy.matrix)

                    if (this.maps[z][x + 1] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x + 5, 2.5, dummy.position.z)
                        subDummy.rotation.y = MathUtils.degToRad(-90)
                        subDummy.scale.set(1, 1, 1)
                    }

                    subDummy.updateMatrix()
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 3, subDummy.matrix)
                } else {
                    dummy.position.set(0, -1000, 0)
                    dummy.scale.set(0, 0, 0)
                    dummy.updateMatrix()

                    walls.setMatrixAt(z * 5 * 4 + x * 4, dummy.matrix)
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 1, dummy.matrix)
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 2, dummy.matrix)
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 3, dummy.matrix)
                }

                grounds.setMatrixAt(z * 5 + x, dummy.matrix)
            }
        }
    }

    createTopLight = (x: number, z: number) => {
        const areaLight: RectAreaLight = new RectAreaLight(new Color(0xffffff), 1, 5, 5)
        areaLight.position.set(x * 10, 5, z * 10)
        areaLight.rotation.x = MathUtils.degToRad(-90)

        this.scene.add(areaLight)
    }

    createColorLight = (
        x: number,
        y: number,
        col: { r: number, g: number, b: number },
        side: string
    ) => {
        const areaLight: RectAreaLight = new RectAreaLight(new Color(col.r, col.g, col.b), 30, 3, 0.2)

        areaLight.position.set(
            x * 10 + (side === "left" ? -5 : side === "right" ? 5 : 0),
            2.5,
            y * 10 + (side === "front" ? -5 : side === "back" ? 5 : 0)
        )

        areaLight.position.x += side === "left" ? 0.1 : side === "right" ? -0.1 : 0
        areaLight.position.z += side === "front" ? 0.1 : side === "back" ? -0.1 : 0

        areaLight.rotation.y =
            side === "front" ? MathUtils.degToRad(180) :
            side === "back" ? 0 :
            side === "left" ? MathUtils.degToRad(-90) :
            side === "right" ? MathUtils.degToRad(90) :
            0

        this.scene.add(areaLight)

        const lightGemometry: PlaneGeometry = new PlaneGeometry(3, 0.2)

        const lightMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
        lightMaterial.colorNode = color(col.r, col.g, col.b)
        lightMaterial.emissiveNode = color(col.r, col.g, col.b)

        const meshLight: Mesh = new Mesh(lightGemometry, lightMaterial)

        meshLight.position.copy(areaLight.position)
        meshLight.rotation.copy(areaLight.rotation)
        meshLight.rotation.y -= MathUtils.degToRad(180)

        this.scene.add(meshLight)
    }

    createLighting = () => {
        RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init())

        this.createTopLight(1, 0)
        this.createTopLight(2, 2)
        this.createTopLight(0, 4)

        this.createColorLight(2, 0, { r: 1, g: 0, b: 0 }, "right")
        this.createColorLight(0, 2, { r: 1, g: 0, b: 0 }, "front")
        this.createColorLight(2, 2, { r: 1, g: 0, b: 0 }, "front")

        this.createColorLight(1, 1, { r: 0, g: 0.35, b: 1 }, "left")
        this.createColorLight(2, 3, { r: 0, g: 0.35, b: 1 }, "back")
        this.createColorLight(4, 2, { r: 0, g: 0.35, b: 1 }, "right")
    }

    private setupTexture = (
        texture: Texture,
        x: number,
        y: number,
        colorSpace: string = SRGBColorSpace
    ) => {
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
        this.createLighting()

        /*const ambientLight: AmbientLight = new AmbientLight(0xffffff, 0.2)
        this.scene.add(ambientLight)

        const directionalLight: DirectionalLight = new DirectionalLight(0xffffff)
        directionalLight.position.set(5, 10, 5)
        this.scene.add(directionalLight)*/

        this.game.action("loading_gui_none", true, 0)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
    }
}

export default Level1