import Game from "./game"
import Plugin from "./plugin"

import {
    AnimationClip,
    AnimationMixer,
    Group,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    Spherical,
    Vector2,
    Vector3,
    type Object3DEventMap
} from "three/webgpu"

import type { GLTF } from "three/examples/jsm/Addons.js"

class Player {
    protected game: Game = null!

    private model: Group<Object3DEventMap> = null!
    private mixer: AnimationMixer = null!

    private cameraPosition: Spherical = new Spherical(20, MathUtils.degToRad(30))

    constructor() {
        this.game = new Game()

        Plugin.gltfLoader.load("models/skeleton_warrior.glb", (data: GLTF) => {
            this.model = data.scene
            this.model.position.set(0, 0, 40)
            this.model.rotation.y = MathUtils.degToRad(180)

            const material: MeshStandardMaterial = new MeshStandardMaterial()
            let isNew: boolean = false

            this.model.traverse((object: Object3D) => {
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

            this.mixer = new AnimationMixer(this.model)
            this.mixer.timeScale = 0.5
            this.mixer.clipAction(animations[2]).play()

            this.game.scene?.add(this.model)
        })
    }

    update = (_delta: number) => {
        if (this.mixer) this.mixer.update(_delta)

        const drag: Vector2 = this.game.triggerMove()

        if (drag.x || drag.y) {
            this.cameraPosition.phi -= drag.y
            this.cameraPosition.phi = Math.max(MathUtils.degToRad(20), Math.min(MathUtils.degToRad(45), this.cameraPosition.phi))
            this.cameraPosition.theta -= drag.x
        }

        if (this.game.camera && this.model) {
            const camPos: Vector3 = new Vector3().setFromSpherical(this.cameraPosition)

            const posX: number = this.model.position.x + camPos.x
            const posY: number = this.model.position.y + camPos.y
            const posZ: number = this.model.position.z + camPos.z

            //this.game.camera.position.set(this.model.position.x + camPos.x, this.model.position.y + camPos.y, this.model.position.z + camPos.z)
            this.game.camera.position.x += (posX - this.game.camera.position.x) / 20
            this.game.camera.position.y += (posY - this.game.camera.position.y) / 20
            this.game.camera.position.z += (posZ - this.game.camera.position.z) / 20

            this.game.camera.lookAt(this.model.position)
        }
    }
}

export default Player