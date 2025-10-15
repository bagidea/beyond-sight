import {
    ImageBitmapLoader
} from "three/webgpu"

class Plugin {
    static imageBitmapLoader: ImageBitmapLoader = new ImageBitmapLoader().setOptions({ imageOrientation: "flipY" }).setPath(self.location.origin+"/")
}

export default Plugin