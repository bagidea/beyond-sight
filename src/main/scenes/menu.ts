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
    AnimationClip,
    MeshStandardMaterial,
    BoxGeometry
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
    reflector,
    fract,
    sin,
    Fn,
    vec4,
    vec3,
    time,
    uv
} from "three/tsl"

import type {
    ShaderNodeObject
} from "three/tsl"

import { RectAreaLightTexturesLib } from "three/examples/jsm/lights/RectAreaLightTexturesLib.js"
import type { GLTF } from "three/examples/jsm/Addons.js"

class Menu extends Scene {
    private mage: Group<Object3DEventMap> = null!
    private mixers: AnimationMixer[] = []

    private cameraX: number = 0
    private cameraY: number = 0

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
        groundMaterial.envNode = reflection.mul(0.2)
        groundMaterial.roughnessNode = texture(groundTexture).mul(0.3)
        groundMaterial.metalnessNode = float(0.9)

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

        //const wallDiffuseImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/brick_diffuse.jpg")
        //const wallBumpImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/brick_bump.jpg")
        const wallDiffuseImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/damaged_plaster_diff_1k.jpg")
        const wallBumpImageBitmap: ImageBitmap = await Plugin.loadImageBitmap("textures/damaged_plaster_nor_gl_1k.jpg")

        const wallDiffuseTexture: Texture = new Texture(wallDiffuseImageBitmap)
        this.setupTexture(wallDiffuseTexture, 2, 1)

        const wallBumpTexture: Texture = new Texture(wallBumpImageBitmap)
        this.setupTexture(wallBumpTexture, 2, 1)

        wallMaterial.colorNode = texture(wallDiffuseTexture)
        wallMaterial.normalNode = bumpMap(texture(wallBumpTexture))
        wallMaterial.roughnessNode = float(0.4)
        wallMaterial.metalnessNode = float(0.2)

        const wallBack: Mesh = new Mesh(wallGeometry, wallMaterial)
        wallBack.position.set(0, 2.5, -5)

        const wallLeft: Mesh = wallBack.clone()
        wallLeft.position.set(-5, 2.5, 0)
        wallLeft.rotation.y = MathUtils.degToRad(90)

        const wallRight: Mesh = wallBack.clone()
        wallRight.rotation.y = MathUtils.degToRad(-90)
        wallRight.position.set(5, 2.5, 0)

        this.scene.add(wallBack, wallLeft, wallRight)

        // Wall Boxs

        const boxGeometry: BoxGeometry = new BoxGeometry(0.5, 5, 0.5)
        const boxMaterial: MeshStandardNodeMaterial = wallMaterial.clone()

        const boxDiffuseTexture: Texture = wallDiffuseTexture.clone()
        this.setupTexture(boxDiffuseTexture, 0.5, 2)

        const boxBumpTexture: Texture = wallBumpTexture.clone()
        this.setupTexture(boxBumpTexture, 0.5, 2)

        boxMaterial.colorNode = texture(boxDiffuseTexture)
        boxMaterial.normalNode = bumpMap(texture(boxBumpTexture))

        const leftBox: Mesh = new Mesh(boxGeometry, boxMaterial)
        leftBox.position.set(-4.75, 2.5, -4.75)

        const rightBox: Mesh = leftBox.clone()
        rightBox.position.set(4.75, 2.5, -4.5)

        this.scene.add(leftBox, rightBox)
    }

    createModels = () => {
        // TV
        Plugin.gltfLoader.load("models/tv.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.scale.set(4, 4, 4)
            model.position.set(0, 0, -1)

            // @ts-ignore
            const noise21 = Fn(({ p, ta, tb }) => {
                return fract(sin(p.x.mul(ta).add(p.y.mul(tb))).mul(5678))
            })

            const frag = Fn(() => {
                const uvCoord = uv()
                const t = time.add(123.0)
                const ta = t.mul(0.654321)
                const tb = t.mul(ta.mul(0.123456))
                // @ts-ignore
                const c = noise21({ p: uvCoord, ta, tb })
                const col = vec3(c)

                return vec4(col, 1.0)
            })

            const screenMaterial: MeshStandardNodeMaterial = new MeshStandardNodeMaterial()
            //screenMaterial.colorNode = color(0.27, 0.31, 0.45).mul(2)
            screenMaterial.colorNode = frag().xyz
            screenMaterial.emissiveNode = color(0.27, 0.31, 0.45).mul(0.4).sub(frag().xyz.mul(0.2)).mul(2)

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

            const material: MeshStandardMaterial = new MeshStandardMaterial()
            let isNew: boolean = false

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.3
                            break
                        case "Helmet":
                        case "Axe":
                        case "Shield":
                            if (!isNew) {
                                isNew = true
                                material.map = object.material.map
                                material.roughness = 0.2
                                material.metalness = 0.5
                            }

                            object.material = material
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
                            object.material.emissiveIntensity = 0.3
                            break
                        case "Blade":
                        case "Shield":
                            object.material.roughness = 0.2
                            object.material.metalness = 0.5
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

        // Skeleton Rogue
        Plugin.gltfLoader.load("models/skeleton_rogue.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(-0.55, 0.5, -1.9)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.3
                            break
                        case "Crossbow":
                        case "Quiver":
                            object.material.roughness = 0.2
                            object.material.metalness = 0.5
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

        // Skeleton Mage
        Plugin.gltfLoader.load("models/skeleton_mage.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(3, 1.25, -3)

            this.mage = model

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.3
                            break
                        case "Staff":
                            object.material.roughness = 0.2
                            object.material.metalness = 0.3
                            break
                    }
                }
            })

            const animations: AnimationClip[] = data.animations

            const mixer: AnimationMixer = new AnimationMixer(model)
            mixer.timeScale = 0.2
            mixer.clipAction(animations[3]).play()
            mixer.clipAction(animations[5]).play()

            this.mixers.push(mixer)

            this.scene.add(model)
        })

        // Killer
        Plugin.gltfLoader.load("models/killer.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(-2.2, 0, 2)
            model.rotation.y = MathUtils.degToRad(60)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.3
                            break
                        default:
                            object.material.roughness = 0.7
                    }
                }
            })

            const animations: AnimationClip[] = data.animations

            const mixer: AnimationMixer = new AnimationMixer(model)
            mixer.timeScale = 0.3
            mixer.clipAction(animations[5]).play()

            this.mixers.push(mixer)

            this.scene.add(model)
        })

        // The Deceased
        Plugin.gltfLoader.load("models/the_deceased.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(1, 0, 2.5)
            model.rotation.y = MathUtils.degToRad(45)

            /*model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.roughness = 0.5
                            object.material.emissive = new Color(0, 0, 0)
                            object.material.emissiveIntensity = 1
                            break
                        default:
                            object.material.transparent = true
                            object.material.opacity = 0.05
                            object.material.emissive = new Color(0.5, 1, 1)
                            object.material.emissiveIntensity = 0.01
                    }
                }
            })*/

            const animations: AnimationClip[] = data.animations

            const mixer: AnimationMixer = new AnimationMixer(model)
            mixer.clipAction(animations[2]).play()

            mixer.update(0)
            //this.mixers.push(mixer)

            this.scene.add(model)
        })
    }

    createLighting = () => {
        RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init())

        const frontAreaLight: RectAreaLight = new RectAreaLight(0xffffff, 0.5, 5, 5)
        frontAreaLight.position.set(0, 10, 5)
        frontAreaLight.lookAt(0, 1, 0)

        //const leftAreaLight: RectAreaLight = new RectAreaLight(new Color(0.247, 0.68, 1), 10, 2, 2)
        const leftAreaLight: RectAreaLight = new RectAreaLight(0x0000ff, 5, 3, 3)
        leftAreaLight.position.set(-10, 2.5, 6)
        leftAreaLight.rotation.y = MathUtils.degToRad(-60)

        //const rightAreaLight: RectAreaLight = new RectAreaLight(new Color(0.95, 0.67, 0.67), 10, 2, 2)
        const rightAreaLight: RectAreaLight = new RectAreaLight(0xff0000, 5, 3, 3)
        rightAreaLight.position.set(10, 2.5, 6)
        rightAreaLight.rotation.y = MathUtils.degToRad(60)

        const tvLight: RectAreaLight = new RectAreaLight(new Color(0.27, 0.31, 0.45), 2, 1.4, 0.95)
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
        this.camera.position.set(0, 2, 5.5)
        this.camera.lookAt(0, 1, 0)
        //this.cameraLookAt(0, 1, 0)

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
        if (this.mage) this.mage.position.y = Math.sin(_time * 0.001) * 0.3 + 1.25

        this.mixers.forEach((mixer: AnimationMixer) => {
            mixer.update(_delta)
        })

        //console.log(this.game.pointerX+" : "+this.game.pointerY)

        this.cameraX += (this.game.pointerX - this.cameraX) / 20
        this.cameraY += (this.game.pointerY - this.cameraY) / 20

        this.camera.position.x = this.cameraX
        this.camera.position.y = 2 - this.cameraY
        this.camera.position.z = 5.5 - Math.cos(_time * 0.0005) * 0.35

        this.camera.lookAt(0, 1, 0)
        //this.cameraLookAt(0, 1, 0)
    }
}

export default Menu