import Scene from "@engine/scene"

import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial
} from "three/webgpu"

class Menu extends Scene {
    start = () => {
        const box: Mesh = new Mesh(
            new BoxGeometry(),
            new MeshBasicMaterial()
        )

        this.scene.add(box)

        this.camera.position.set(3, 3, 3)
        this.cameraLookAt(0, 0, 0)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
    }
}

export default Menu