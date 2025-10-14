import Game from "./game"

let game: Game = null!

self.onmessage = (e: MessageEvent) => {
    if (e.data.type === "init") {
        const canvas: OffscreenCanvas = e.data.canvas
        const width: number = e.data.width
        const height: number = e.data.height
        const pixelRatio: number = e.data.pixelRatio

        if (canvas) {
            game = new Game()
            game.init(canvas, width, height, pixelRatio)
        }
    }
    else if (e.data.type === "resize") {
        const width: number = e.data.width
        const height: number = e.data.height

        if (game) game.resize(width, height)
    }
}