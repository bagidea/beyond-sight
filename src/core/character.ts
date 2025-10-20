import Game from "./game"

import {
    CapsuleGeometry,
    Mesh,
    MeshBasicMaterial,
    Vector3,
} from "three/webgpu"

import type { RapierPhysicsObject } from "three/examples/jsm/Addons.js"

class Character {
    protected game: Game = null!

    protected physics: RapierPhysicsObject = null!
    protected controller: any = null!
    protected character: Mesh = null!

    constructor(physics: RapierPhysicsObject) {
        this.game = new Game()

        this.physics = physics

        if (this.physics) {
            const position: Vector3 = new Vector3(0, 1, 40)

            this.character = new Mesh(
                new CapsuleGeometry(0.8, 0.5, 8, 8),
                new MeshBasicMaterial({
                    transparent: true,
                    opacity: 0
                })
            )

            this.character.position.copy(position)
            this.game.scene?.add(this.character)

            this.controller = this.physics.world.createCharacterController(0.01)
            this.controller.setApplyImpulsesToDynamicBodies(true)
            this.controller.setCharacterMass(3)

            const colliderDesc = this.physics.RAPIER.ColliderDesc.capsule(0.25, 0.8).setTranslation(position.x ,position.y, position.z)
            this.character.userData.collider = this.physics.world.createCollider(colliderDesc)
        }
    }

    isReady = () => {
        return this.physics && this.controller && this.character
    }

    updatePhysics = (speed: number, moveDirection: Vector3 = new Vector3()) => {
        const moveVector = new this.physics.RAPIER.Vector3(moveDirection.x * speed, moveDirection.y * speed, moveDirection.z * speed)

        this.controller.computeColliderMovement(this.character.userData.collider, moveVector)

        const translation = this.controller.computedMovement()
        const position = this.character.userData.collider.translation()

        position.x += translation.x
        position.y += translation.y
        position.z += translation.z

        this.character.userData.collider.setTranslation(position)
        this.character.position.set(position.x, position.y, position.z)
    }
}

export default Character