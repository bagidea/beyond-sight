import Main from "./main"

let game: Main = null!

let isDragging: boolean = false
let lastX: number = 0
let lastY: number = 0

const sensitivity: number = 0.005

const keysState: Record<string, boolean> = {}

self.onmessage = (e: MessageEvent) => {
    switch (e.data.type) {
        case "init":
            if (e.data.canvas) {
                game = new Main()
                game.init(self, e.data.canvas, e.data.width, e.data.height, e.data.pixelRatio)
                game.action("game_canvas", true, 1)
            }

            break
        case "resize":
            if (game) game.resize(e.data.width, e.data.height)

            break
        case "pointerdown":
            isDragging = true
            lastX = e.data.x
            lastY = e.data.y

            break
        case "pointerup":
            isDragging = false

            break
        case "pointermove":
            if (isDragging) {
                const dx: number = (e.data.x - lastX) * sensitivity
                const dy: number = (e.data.y - lastY) * sensitivity

                lastX = e.data.x
                lastY = e.data.y

                game.pointerDrag(dx, dy, e.data.buttons)
            }

            game.pointerUpdate(e.data.x / e.data.width, e.data.y / e.data.height)

            break
        case "key":
            keysState[e.data.code] = e.data.pressed

            game.cameraKeys(
                keysState["KeyW"],
                keysState["KeyS"],
                keysState["KeyA"],
                keysState["KeyD"]
            )

            break
        case "clearscene":
            game.clearScene()
            game.gameScene = null
            game.loadGameScene("level_1")

            break
        default:
            console.log("Invalid type!")
    }
}