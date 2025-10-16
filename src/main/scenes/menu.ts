import Plugin from "@engine/plugin"
import Scene from "@engine/scene"

import {
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
    Color,
    AnimationClip
} from "three/webgpu"

import {
    AnimationMixer,
    type Object3DEventMap,
    type ReflectorNode
} from "three/webgpu"

import {
    texture,
    bumpMap,
    float,
    color,
    reflector
} from "three/tsl"

import type {
    ShaderNodeObject
} from "three/tsl"

import { RectAreaLightTexturesLib } from "three/examples/jsm/lights/RectAreaLightTexturesLib.js"
import type { GLTF } from "three/examples/jsm/Addons.js"

class Menu extends Scene {
    private mixers: AnimationMixer[] = []

    createGroundAndTop = async() => {
        const groundGeometry: PlaneGeometry = new PlaneGeometry(10, 10)
        const groundMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()

        const groundImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/lavatile.jpg")

        const groundTexture: Texture = new Texture(groundImageBitmap)
        this.setupTexture(groundTexture, 5, 5, NoColorSpace)

        const reflection: ShaderNodeObject<ReflectorNode> = reflector()
        reflection.target.rotation.x = MathUtils.degToRad(-90)

        this.scene.add(reflection.target)

        groundMaterial.colorNode = color(1, 1, 1)
        groundMaterial.envNode = reflection.mul(0.1)
        groundMaterial.roughnessNode = texture(groundTexture).mul(0.3)
        groundMaterial.metalnessNode = float(1)

        const ground: Mesh = new Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = MathUtils.degToRad(-90)

        const top: Mesh = ground.clone()
        top.position.set(0, 5, 0)
        top.rotation.x = MathUtils.degToRad(90)

        this.scene.add(ground, top)
    }

    createWalls = async() => {
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
    }

    createModels = () => {
        // TV
        Plugin.gltfLoader.load("models/tv.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.scale.set(4, 4, 4)
            model.position.set(0, 0, -1)

            const screenMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
            screenMaterial.colorNode = color(0.27, 0.31, 0.45).mul(2)
            screenMaterial.emissiveNode = color(0.27, 0.31, 0.45).mul(0.5)

            const bodyMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
            bodyMaterial.colorNode = color(0.4, 0.4, 0.4)
            bodyMaterial.roughnessNode = float(0.45)

            const darkMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
            darkMaterial.colorNode = color(0.2, 0.2, 0.2)
            darkMaterial.roughnessNode = float(0.2)
            darkMaterial.metalnessNode = float(1)

            const lightMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
            lightMaterial.colorNode = color(1, 1, 1)
            lightMaterial.roughnessNode = float(0.2)
            lightMaterial.metalnessNode = float(1)

            const borderInsideMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
            borderInsideMaterial.colorNode = color(0, 0, 0)
            borderInsideMaterial.metalnessNode = float(1)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Screen":
                            object.material = screenMaterial
                            break
                        case "Body":
                            object.material = bodyMaterial
                            break
                        case "Border":
                        case "LightProp":
                            object.material = lightMaterial
                            break
                        case "DarkProp":
                            object.material = darkMaterial
                            break
                        case "BorderInside":
                            object.material = borderInsideMaterial
                            break
                    }
                }
            })

            this.scene.add(model)
        })

        // Skeleton Warrior
        Plugin.gltfLoader.load("models/skeleton_warrior.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(-3, 0, -3.5)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.5
                            break
                        case "Helmet":
                        case "Axe":
                        case "Shield":
                            object.material.roughness = 0.3
                            object.material.metalness = 1
                            break
                    }
                }
            })

            const animations: AnimationClip[] = data.animations

            const mixer: AnimationMixer = new AnimationMixer(model)
            mixer.timeScale = 0.5
            mixer.clipAction(animations[2]).play()

            this.mixers.push(mixer)

            this.scene.add(model)
        })

        // Skeleton Minion
        Plugin.gltfLoader.load("models/skeleton_minion.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(1.8, 0, 0)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.5
                            break
                        case "Blade":
                        case "Shield":
                            object.material.roughness = 0.2
                            object.material.metalness = 1
                            break
                    }
                }
            })

            const animations: AnimationClip[] = data.animations

            const mixer: AnimationMixer = new AnimationMixer(model)
            mixer.clipAction(animations[2]).play()

            this.mixers.push(mixer)

            this.scene.add(model)
        })
    }

    createLighting = () => {
        RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init())

        const frontAreaLight: RectAreaLight = new RectAreaLight(0xffffff, 0.05, 10, 5)
        frontAreaLight.position.set(0, 2.5, 5)

        const leftAreaLight: RectAreaLight = new RectAreaLight(new Color(0.247, 0.68, 1), 5, 10, 5)
        leftAreaLight.position.set(-84.9, 2.5, 0)
        leftAreaLight.rotation.y = MathUtils.degToRad(-90)

        const rightAreaLight: RectAreaLight = new RectAreaLight(new Color(0.95, 0.67, 0.67), 5, 10, 5)
        rightAreaLight.position.set(84.9, 2.5, 0)
        rightAreaLight.rotation.y = MathUtils.degToRad(90)

        const tvLight: RectAreaLight = new RectAreaLight(new Color(0.27, 0.31, 0.45), 2, 1.2, 1)
        tvLight.position.set(-0.2, 0.9, -0.35)
        tvLight.rotation.y = MathUtils.degToRad(180)

        this.scene.add(frontAreaLight, leftAreaLight, rightAreaLight, tvLight)
        //this.scene.add(tvLight)
    }

    start = () => {
        // Ground and Top
        this.createGroundAndTop()

        // Walls
        this.createWalls()

        // Models
        this.createModels()

        // Camera
        this.camera.position.set(0, 2, 5)
        this.cameraLookAt(0, 0.5, 0)

        // Lightings
        this.createLighting()
    }

    private setupTexture = (texture: Texture, x: number, y: number, colorSpace: string = SRGBColorSpace) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(x, y)
        texture.colorSpace = colorSpace
        texture.needsUpdate = true
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
        this.mixers.forEach((mixer: AnimationMixer) => {
            mixer.update(_delta)
        })
    }
}

export default Menu