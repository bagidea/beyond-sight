import Scene from "@engine/scene"

import {
    BoxGeometry,
    Mesh,
    MeshBasicMaterial
} from "three/webgpu"

class Level1 extends Scene {
    box: Mesh = null!

    start = () => {
        this.box = new Mesh(
            new BoxGeometry(),
            new MeshBasicMaterial()
        )

        this.scene.add(this.box)

        this.camera.position.set(3, 3, 3)
        this.cameraLookAt(0, 0, 0)

        this.game.action("loading_gui_none", true, 3)
    }

    update = (_time: DOMHighResTimeStamp, _delta: number) => {
        if (this.box) this.box.rotation.y += _delta
    }
}

export default Level1