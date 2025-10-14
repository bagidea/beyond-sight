import Game from "./game"

let game: Game = null!

self.onmessage = (e: MessageEvent) => {
    switch (e.data.type) {
        case "init":
            if (e.data.canvas) {
                game = new Game()
                game.init(e.data.canvas, e.data.width, e.data.height, e.data.pixelRatio)
            }
            break
        case "resize":
            if (game) game.resize(e.data.width, e.data.height)
            break
        default:
            console.log("Invalid type!")
    }
}