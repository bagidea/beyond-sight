import {
    ImageBitmapLoader
} from "three/webgpu"

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
}

export default Plugin