import Plugin from "@engine/plugin"
import Scene from "@engine/scene"
import Player from "@engine/player"

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
    DoubleSide,
    RectAreaLight,
    Color,
    Mesh,
    PointLight,
    Group,
    BoxGeometry,
    AnimationClip,
    Vector3,
    AnimationMixer,
    MeshStandardMaterial
} from "three/webgpu"

import type {
    Object3DEventMap
} from "three/webgpu"

import {
    bumpMap,
    color,
    float,
    Fn,
    fract,
    reflector,
    sin,
    texture,
    time,
    uv,
    vec3,
    vec4
} from "three/tsl"

import type { ShaderNodeObject } from "three/tsl"

import {
    RapierPhysics,
    SkeletonUtils
} from "three/examples/jsm/Addons.js"

import type {
    GLTF,
    RapierPhysicsObject
} from "three/examples/jsm/Addons.js"

class Level1 extends Scene {
    private loaded: number = 0
    private maxLoad: number = 10

    private physics: RapierPhysicsObject = null!

    // 5 x 5
    private maps: Array<Array<number>> = [
        [ 0, 1, 1, 0, 0 ],
        [ 0, 1, 0, 0, 0 ],
        [ 1, 1, 1, 1, 1 ],
        [ 1, 0, 1, 0, 0 ],
        [ 1, 0, 0, 0, 0 ]
    ]

    private player: Player = null!

    // Characters mockup
    private mixers: AnimationMixer[] = []
    private mage: Object3D<Object3DEventMap> = null!

    physicsInit = async() => {
        this.physics = await RapierPhysics()
        this.physics.addScene(this.scene)

        // Ground Collider
        const groundCollider: Mesh = new Mesh(
            new BoxGeometry(50, 0.2, 50),
            new MeshStandardNodeMaterial()
        )

        groundCollider.position.x = 20
        groundCollider.position.z = 20

        //this.scene.add(groundCollider)
        this.physics.addMesh(groundCollider)

        // Collider
        Plugin.gltfLoader.load("models/collider.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.z = 40

            const collider: Mesh = model.getObjectByName("Collider") as Mesh
            
            if (collider) {
                const mesh: Mesh = collider.clone()
                mesh.position.z = 40

                //this.scene.add(mesh)
                this.physics.addMesh(mesh, 0)
            }

            //this.scene.add(model)

            this.loadedAction()
        })

        /*const test: Mesh = new Mesh(
            new BoxGeometry(3, 1, 1),
            new MeshStandardNodeMaterial()
        )

        test.position.set(2, 20, 40)

        this.scene.add(test)
        this.physics.addMesh(test, 1, 0.5)*/
    }

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
        groundMaterial.envNode = reflection.mul(0.5)
        groundMaterial.roughnessNode = texture(groundTexture).mul(0.4)
        groundMaterial.metalnessNode = float(0.8)

        let groundIndex: number = 0
        const grounds: InstancedMesh = new InstancedMesh(groundGeometry, groundMaterial, 11) // default count 25
        grounds.frustumCulled = false
        //grounds.receiveShadow = true
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

        let wallIndex: number = 0
        const walls: InstancedMesh = new InstancedMesh(wallGeometry, wallMaterial, 44) // default count 100
        //walls.receiveShadow = true
        //walls.castShadow = true
        walls.frustumCulled = false
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
                    //walls.setMatrixAt(z * 5 * 4 + x * 4, subDummy.matrix)
                    walls.setMatrixAt(wallIndex++, subDummy.matrix)

                    if (this.maps[z - 1]?.[x] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x, 2.5, dummy.position.z - 5)
                        subDummy.rotation.y = 0
                        subDummy.scale.set(1, 1, 1)
                    }

                    subDummy.updateMatrix()
                    //walls.setMatrixAt(z * 5 * 4 + x * 4 + 1, subDummy.matrix)
                    walls.setMatrixAt(wallIndex++, subDummy.matrix)

                    if (this.maps[z][x - 1] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x - 5, 2.5, dummy.position.z)
                        subDummy.scale.set(1, 1, 1)
                        subDummy.rotation.y = MathUtils.degToRad(90)
                    }

                    subDummy.updateMatrix()
                    //walls.setMatrixAt(z * 5 * 4 + x * 4 + 2, subDummy.matrix)
                    walls.setMatrixAt(wallIndex++, subDummy.matrix)

                    if (this.maps[z][x + 1] === 1) {
                        subDummy.position.set(0, -1000, 0)
                        subDummy.scale.set(0, 0, 0)
                    } else {
                        subDummy.position.set(dummy.position.x + 5, 2.5, dummy.position.z)
                        subDummy.rotation.y = MathUtils.degToRad(-90)
                        subDummy.scale.set(1, 1, 1)
                    }

                    subDummy.updateMatrix()
                    //walls.setMatrixAt(z * 5 * 4 + x * 4 + 3, subDummy.matrix)
                    walls.setMatrixAt(wallIndex++, subDummy.matrix)

                    grounds.setMatrixAt(groundIndex++, dummy.matrix) // optimized instancedMesh
                } /*else {
                    dummy.position.set(0, -1000, 0)
                    dummy.scale.set(0, 0, 0)
                    dummy.updateMatrix()

                    walls.setMatrixAt(z * 5 * 4 + x * 4, dummy.matrix)
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 1, dummy.matrix)
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 2, dummy.matrix)
                    walls.setMatrixAt(z * 5 * 4 + x * 4 + 3, dummy.matrix)
                }*/

                //grounds.setMatrixAt(z * 5 + x, dummy.matrix) // default calculate
            }
        }

        this.loadedAction()
    }

    createModels = () => {
        // Props
        Plugin.gltfLoader.load("models/props.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.z = 40

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    object.material.roughness = 0.3
                }
            })

            this.scene.add(model)

            this.loadedAction()
        })

        // TV
        Plugin.gltfLoader.load("models/tv.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.scale.set(4, 4, 4)
            model.position.set(13.8, 0, 15)
            model.rotation.y = MathUtils.degToRad(-45)

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


            // Collider
            const collider: Mesh = new Mesh(
                new BoxGeometry(2.5, 1, 2.5),
                new MeshStandardNodeMaterial()
            )

            collider.position.copy(model.position)
            collider.position.y = 1
            collider.quaternion.copy(model.quaternion)

            //this.scene.add(collider)
            this.physics.addMesh(collider, 0)

            this.loadedAction()
        })

        // Characters mockup

        // Skeleton Warrior
        Plugin.gltfLoader.load("models/skeleton_warrior.glb", (data: GLTF) => {
            const group: Group<Object3DEventMap> = data.scene
            const animations: AnimationClip[] = data.animations

            const positions: Array<Vector3> = [
                new Vector3(-2, 0, 20),
                new Vector3(24, 0, 16)
            ]

            const rotationYs: Array<number> = [
                MathUtils.degToRad(45),
                MathUtils.degToRad(-40),
            ]

            const defaultAnimations: Array<number> = [ 5, 2 ]

            for (let i: number = 0; i < 2; i++) {
                const model: Object3D<Object3DEventMap> = SkeletonUtils.clone(group)

                model.position.copy(positions[i])
                model.rotation.y = rotationYs[i]

                const material: MeshStandardMaterial = new MeshStandardMaterial()
                let isNew: boolean = false

                model.traverse((object: Object3D) => {
                    if (object instanceof Mesh) {
                        switch (object.name) {
                            case "Eyes":
                                object.material.emissiveIntensity = 0.5
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

                const mixer: AnimationMixer = new AnimationMixer(model)
                //mixer.timeScale = 0.5
                mixer.clipAction(animations[defaultAnimations[i]]).play()

                this.mixers.push(mixer)

                this.scene.add(model)
            }

            this.loadedAction()
        })

        // Skeleton Minion
        Plugin.gltfLoader.load("models/skeleton_minion.glb", (data: GLTF) => {
            const group: Group<Object3DEventMap> = data.scene
            const animations: AnimationClip[] = data.animations

            const positions: Array<Vector3> = [
                new Vector3(13, 0, -4),
                new Vector3(10, 0, 22)
            ]

            const rotationYs: Array<number> = [
                0,
                MathUtils.degToRad(-120),
            ]

            const defaultAnimations: Array<number> = [ 5, 2 ]

            for (let i: number = 0; i < 2; i++) {
                const model: Object3D<Object3DEventMap> = SkeletonUtils.clone(group)

                model.position.copy(positions[i])
                model.rotation.y = rotationYs[i]

                model.traverse((object: Object3D) => {
                    if (object instanceof Mesh) {
                        switch (object.name) {
                            case "Eyes":
                                object.material.emissiveIntensity = 0.5
                                break
                            case "Blade":
                            case "Shield":
                                object.material.roughness = 0.2
                                object.material.metalness = 0.5
                                break
                        }
                    }
                })

                const mixer: AnimationMixer = new AnimationMixer(model)
                //mixer.timeScale = 0.5
                mixer.clipAction(animations[defaultAnimations[i]]).play()

                this.mixers.push(mixer)

                this.scene.add(model)
            }

            this.loadedAction()
        })

        // Skeleton Rogue
        Plugin.gltfLoader.load("models/skeleton_rogue.glb", (data: GLTF) => {
            const group: Group<Object3DEventMap> = data.scene
            const animations: AnimationClip[] = data.animations

            const positions: Array<Vector3> = [
                new Vector3(20, 0, 32.5),
                new Vector3(20, 0, 3)
            ]

            const rotationYs: Array<number> = [
                MathUtils.degToRad(-170),
                MathUtils.degToRad(-120),
            ]

            const defaultAnimations: Array<number> = [ 5, 2 ]

            for (let i: number = 0; i < 2; i++) {
                const model: Object3D<Object3DEventMap> = SkeletonUtils.clone(group)

                model.position.copy(positions[i])
                model.rotation.y = rotationYs[i]

                model.traverse((object: Object3D) => {
                    if (object instanceof Mesh) {
                        switch (object.name) {
                            case "Eyes":
                                object.material.emissiveIntensity = 0.5
                                break
                            case "Crossbow":
                            case "Quiver":
                                object.material.roughness = 0.2
                                object.material.metalness = 0.5
                                break
                        }
                    }
                })

                const mixer: AnimationMixer = new AnimationMixer(model)
                //mixer.timeScale = 0.5
                mixer.clipAction(animations[defaultAnimations[i]]).play()

                this.mixers.push(mixer)

                this.scene.add(model)
            }


            this.loadedAction()
        })

        // Skeleton Mage
        Plugin.gltfLoader.load("models/skeleton_mage.glb", (data: GLTF) => {
            const group: Group<Object3DEventMap> = data.scene
            const animations: AnimationClip[] = data.animations

            const positions: Array<Vector3> = [
                new Vector3(-1.5, 0, 41.5),
                new Vector3(40, 0, 20)
            ]

            const rotationYs: Array<number> = [
                MathUtils.degToRad(170),
                MathUtils.degToRad(-90),
            ]

            const defaultAnimations: Array<number> = [ 2, 3 ]

            for (let i: number = 0; i < 2; i++) {
                const model: Object3D<Object3DEventMap> = SkeletonUtils.clone(group)

                model.position.copy(positions[i])
                model.rotation.y = rotationYs[i]

                model.traverse((object: Object3D) => {
                    if (object instanceof Mesh) {
                        switch (object.name) {
                            case "Eyes":
                                object.material.emissiveIntensity = 0.5
                                break
                            case "Staff":
                                object.material.roughness = 0.2
                                object.material.metalness = 0.3
                                break
                        }
                    }
                })

                const mixer: AnimationMixer = new AnimationMixer(model)
                //mixer.timeScale = 0.5
                mixer.clipAction(animations[defaultAnimations[i]]).play()

                if (i == 1) {
                    mixer.timeScale = 0.2
                    mixer.clipAction(animations[5]).play()
                    this.mage = model
                }

                this.mixers.push(mixer)

                this.scene.add(model)
            }

            this.loadedAction()
        })

        // Killer
        Plugin.gltfLoader.load("models/killer.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(34, 0, 16)
            model.rotation.y = MathUtils.degToRad(-60)

            model.traverse((object: Object3D) => {
                if (object instanceof Mesh) {
                    switch (object.name) {
                        case "Eyes":
                            object.material.emissiveIntensity = 0.5
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

            this.loadedAction()
        })

        // The Deceased
        Plugin.gltfLoader.load("models/the_deceased.glb", (data: GLTF) => {
            const model: Group<Object3DEventMap> = data.scene
            model.position.set(3, 0, 18)
            model.rotation.y = MathUtils.degToRad(45)

            const animations: AnimationClip[] = data.animations

            const mixer: AnimationMixer = new AnimationMixer(model)
            mixer.clipAction(animations[2]).play()

            mixer.update(0)
            //this.mixers.push(mixer)

            this.scene.add(model)

            this.loadedAction()
        })

    }

    /*createTopLight = (x: number, z: number) => {
        const areaLight: RectAreaLight = new RectAreaLight(new Color(0xffffff), 1, 5, 5)
        areaLight.position.set(x * 10, 5, z * 10)
        areaLight.rotation.x = MathUtils.degToRad(-90)

        this.scene.add(areaLight)
    }*/

    createTopLight = (x: number, z: number) => {
        const pointLight: PointLight = new PointLight(0xffffff, 20)
        //pointLight.castShadow = true
        //pointLight.shadow.mapSize = new Vector2(32, 32)
        //pointLight.shadow.bias = -0.005
        pointLight.position.set(x * 10, 5, z * 10)
        this.scene.add(pointLight)
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
        this.createTopLight(1, 0)
        this.createTopLight(2, 2)
        this.createTopLight(0, 4)

        this.createColorLight(2, 0, { r: 1, g: 0, b: 0 }, "right")
        this.createColorLight(0, 2, { r: 1, g: 0, b: 0 }, "front")
        //this.createColorLight(2, 2, { r: 1, g: 0, b: 0 }, "front")

        //this.createColorLight(1, 1, { r: 0, g: 0.35, b: 1 }, "left")
        this.createColorLight(2, 3, { r: 0, g: 0.35, b: 1 }, "back")
        this.createColorLight(4, 2, { r: 0, g: 0.35, b: 1 }, "right")
    }

    guiInit = () => {
        this.game.action("loading_gui_none", true, 3)
    }

    loadedAction = () => {
        this.loaded++
        if (this.loaded >= this.maxLoad) this.guiInit()
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

    start = async() => {
        // Physics Init
        await this.physicsInit()

        // Create Map
        await this.createMap()

        // Create Models
        this.createModels()

        this.camera.position.set(0, 20, 4 * 10 + 5)
        //this.cameraLookAt(0, 0, 4 * 10)
        this.cameraLookAt(2.5 * 10, 0, 2.5 * 10)

        // Lightings
        this.createLighting()

        // Create Player
        this.player = new Player(this.physics)

        //this.game.action("loading_gui_none", true, 0)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
        if (this.mage) this.mage.position.y = Math.sin(_time * 0.002) * 0.5 + 1.25

        this.mixers.forEach((mixer: AnimationMixer) => {
            mixer.update(_delta)
        })

        if (this.player) this.player.update(_delta)
    }
}

export default Level1