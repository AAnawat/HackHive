import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";

import "@xterm/xterm/css/xterm.css";
import { io } from "socket.io-client";


interface XtermInput {
    host: string
}

export default function Xterm({ host }: XtermInput) {
    const termRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const fitAddon = new FitAddon()
        const term = new Terminal()
        term.loadAddon(fitAddon)

        socketRef.current = io(host, {
            timeout: 5000,
            reconnection: false
        })
        const dataProcess = (data: any) => {
            term.write(data)
        }
        socketRef.current.on("data", dataProcess)

        term.open(termRef.current)
        fitAddon.fit()

        term.onKey((key) => {
            socketRef.current.emit("key", JSON.stringify({
                type: "onkey",
                key: key.key
            }))
        })

        const handleResize = () => fitAddon.fit()
        window.addEventListener("resize", handleResize)

        return () => {
            socketRef.current.disconnect()
            socketRef.current.off("data", dataProcess)
            window.removeEventListener("resize", handleResize)
            term.dispose()
        }
    }, [])

    return <div ref={termRef} className="h-full w-full"></div>
}
