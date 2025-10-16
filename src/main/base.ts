window.onload = () => {
    const container: HTMLDivElement = document.getElementById("container") as HTMLDivElement
    const canvas: HTMLCanvasElement = document.getElementById("game-canvas") as HTMLCanvasElement

    const offscreen: OffscreenCanvas = canvas.transferControlToOffscreen()

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
/*
    const keys: Record<string, boolean> = {}

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
    })
*/
}