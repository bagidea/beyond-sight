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
}