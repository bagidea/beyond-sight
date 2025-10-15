import Main from "./main"

let game: Main = null!

let isDragging: boolean = false
let lastX: number = 0
let lastY: number = 0

const sensitivity: number = 0.005

self.onmessage = (e: MessageEvent) => {
    switch (e.data.type) {
        case "init":
            if (e.data.canvas) {
                game = new Main()
                game.init(e.data.canvas, e.data.width, e.data.height, e.data.pixelRatio)
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

            break
        default:
            console.log("Invalid type!")
    }
}