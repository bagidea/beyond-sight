window.onload = () => {
    const container: HTMLDivElement = document.getElementById("container") as HTMLDivElement

    const canvas: HTMLCanvasElement = document.getElementById("game-canvas") as HTMLCanvasElement
    canvas.classList.remove("open")

    const offscreen: OffscreenCanvas = canvas.transferControlToOffscreen()

    ///////////// Game GUI ///////////////

    const loading_gui: HTMLDivElement = document.getElementById("loading_gui") as HTMLDivElement
    loading_gui.classList.add("open")

    const main_menu: HTMLDivElement = document.getElementById("main_menu") as HTMLDivElement
    const main_description: HTMLDivElement = document.getElementById("main_description") as HTMLDivElement

    const main_action = (action: boolean) => {
        if (action) {
            main_menu.classList.add("open")
            main_description.classList.add("open")
        } else {
            main_menu.classList.remove("open")
            main_description.classList.remove("open")
        }
    }

    /////////////////////////////////////

    const worker: Worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })

    worker.postMessage({
        type: "init",
        canvas: offscreen,
        width: container.clientWidth,
        height: container.clientHeight,
        pixelRatio: window.devicePixelRatio
    }, [offscreen])

    window.addEventListener("resize", () => {
        worker.postMessage({
            type: "resize",
            width: container.clientWidth,
            height: container.clientHeight
        })
    })

    // Pointer Events

    canvas.addEventListener("contextmenu", (e: PointerEvent) => e.preventDefault())
    /*canvas.addEventListener("pointerup", () => worker.postMessage({ type: "pointerup" }))

    canvas.addEventListener("pointerdown", (e: PointerEvent) => {
        worker.postMessage({
            type: "pointerdown",
            x: e.clientX,
            y: e.clientY
        })
    })*/

    canvas.addEventListener("pointermove", (e: PointerEvent) => {
        worker.postMessage({
            type: "pointermove",
            x: e.clientX,
            y: e.clientY,
            width: window.innerWidth,
            height: window.innerHeight,
            buttons: e.buttons
        })
    })

    // Keyboard Events

    /*const keys: Record<string, boolean> = {}

    window.addEventListener("keydown", (e: KeyboardEvent) => {
        if (!keys[e.code]) {
            keys[e.code] = true

            worker.postMessage({
                type: "key",
                code: e.code,
                pressed: true
            })
        }
    })

    window.addEventListener("keyup", (e: KeyboardEvent) => {
        if (keys[e.code]) {
            keys[e.code] = false

            worker.postMessage({
                type: "key",
                code: e.code,
                pressed: false
            })
        }
    })*/

    worker.onmessage = (e: MessageEvent) => {
        switch (e.data.type) {
            case "game_canvas":
                canvas.classList.add("open")

                break
            case "loading_gui":
                loading_gui.classList.remove("open")

                break
            case "main_action":
                main_action(e.data.action)

                break
            case "game_action":
                break
            default:
                console.log("Invalid type! [ return ]")
        }
    }
}