import { ImageBitmapLoader } from "three/webgpu"
import { GLTFLoader } from "three/examples/jsm/Addons.js"

class Plugin {
    static imageBitmapLoader: ImageBitmapLoader = new ImageBitmapLoader().setOptions({ imageOrientation: "flipY" }).setPath(self.location.origin+"/")

    static loadImageBitmap = (url: string): Promise<ImageBitmap> => {
        return new Promise((resolve, reject) => {
            Plugin.imageBitmapLoader.load(
                url,
                (data: ImageBitmap) => {
                    resolve(data)
                },
                undefined,
                (err: unknown) => reject(err)
            )
        })
    }

    static gltfLoader: GLTFLoader = new GLTFLoader().setPath(self.location.origin+"/")
}

export default Plugin