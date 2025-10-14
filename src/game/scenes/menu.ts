import Scene from "../scene"

import {
    Mesh,
    BoxGeometry,
    MeshBasicMaterial
} from "three/webgpu"

class Menu extends Scene {
    private box: Mesh = null!

    start = () => {
        this.box = new Mesh(
            new BoxGeometry(),
            new MeshBasicMaterial()
        )

        this.scene.add(this.box)

        this.camera.position.set(3, 3, 3)
        this.camera.lookAt(0, 0, 0)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
        this.box.rotation.y += 0.01
    }
}

export default Menu