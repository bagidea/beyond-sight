import Plugin from "./plugin"
import Character from "./character"

import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    Spherical,
    Vector2,
    Vector3
} from "three/webgpu"

import {
    type Object3DEventMap,
    type Group,
    Quaternion
} from "three/webgpu"

import type { GLTF, RapierPhysicsObject } from "three/examples/jsm/Addons.js"

class Player extends Character {
    private model: Group<Object3DEventMap> = null!
    private mixer: AnimationMixer = null!

    private animations: Map<string, AnimationClip> = new Map<string, AnimationClip>()
    private actions: Map<string, AnimationAction> = new Map<string, AnimationAction>()

    private cameraPosition: Spherical = new Spherical(20, MathUtils.degToRad(30))

    private speed: number = 5

    private state: string = "Idle"

    constructor(physics: RapierPhysicsObject) {
        super(physics)

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

            this.mixer = new AnimationMixer(this.model)
            //this.mixer.timeScale = 0.5

            data.animations.forEach((clip: AnimationClip) => {
                this.animations.set(clip.name, clip)

                if (
                    clip.name === "Idle" ||
                    clip.name === "Run"
                ) {
                    this.actions.set(clip.name, this.mixer.clipAction(this.animations.get(clip.name) as AnimationClip))
                }
            })

            this.actions.get("Idle")?.play()

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

        if (this.game.camera && this.isReady() && this.model) {
            // Controller ////

            const forward: Vector3 = new Vector3()

            this.game.camera.getWorldDirection(forward)
            forward.y = 0
            forward.normalize()

            const right: Vector3 = new Vector3()
            right.crossVectors(forward, this.game.camera.up).normalize()

            const moveDirection: Vector3 = new Vector3()

            if (this.game.keysState["KeyW"]) moveDirection.add(forward)
            if (this.game.keysState["KeyS"]) moveDirection.sub(forward)
            if (this.game.keysState["KeyA"]) moveDirection.sub(right)
            if (this.game.keysState["KeyD"]) moveDirection.add(right)

            if (moveDirection.lengthSq() > 0) moveDirection.normalize()

            this.updatePhysics(this.speed * _delta, moveDirection)

            //////////////////

            this.model.position.copy(this.character.position)
            this.model.position.y -= 1

            const targetRotation: Quaternion = new Quaternion()
            targetRotation.setFromUnitVectors(new Vector3(0, 0, 1), moveDirection)

            if (
                this.game.keysState["KeyW"] ||
                this.game.keysState["KeyS"] ||
                this.game.keysState["KeyA"] ||
                this.game.keysState["KeyD"]
            ) {
                this.model.quaternion.slerp(targetRotation, 0.1)

                if (this.state !== "Run") {
                    this.state = "Run"
                    this.actions.get("Idle")?.fadeOut(0.2)
                    this.actions.get("Run")?.reset()
                    this.actions.get("Run")?.fadeIn(0.2).play()
                }
            } else {
                if (this.state !== "Idle") {
                    this.state = "Idle"
                    this.actions.get("Run")?.fadeOut(0.2)
                    this.actions.get("Idle")?.reset()
                    this.actions.get("Idle")?.fadeIn(0.2).play()
                }
            }

            // Run
            if (this.game.keysState["ShiftLeft"]) {
                if (this.state === "Run") this.mixer.timeScale = 2
                else this.mixer.timeScale = 1

                this.speed = 10
            } else {
                this.mixer.timeScale = 1
                this.speed = 5
            }

            //////////////////

            // Carmera

            const camPos: Vector3 = new Vector3().setFromSpherical(this.cameraPosition)

            const posX: number = this.character.position.x + camPos.x
            const posY: number = this.character.position.y + camPos.y
            const posZ: number = this.character.position.z + camPos.z

            //this.game.camera.position.set(this.model.position.x + camPos.x, this.model.position.y + camPos.y, this.model.position.z + camPos.z)
            this.game.camera.position.x += (posX - this.game.camera.position.x) / 20
            this.game.camera.position.y += (posY - this.game.camera.position.y) / 20
            this.game.camera.position.z += (posZ - this.game.camera.position.z) / 20

            this.game.camera.lookAt(this.character.position)
        }
    }
}

export default Player